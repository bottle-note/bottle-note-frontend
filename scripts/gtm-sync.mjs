#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API_BASE = 'https://tagmanager.googleapis.com/tagmanager/v2';
const EDIT_SCOPE = 'https://www.googleapis.com/auth/tagmanager.edit.containers';
const PUBLISH_SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
  'https://www.googleapis.com/auth/tagmanager.publish',
];
const CONFIG_PATH = path.resolve(process.cwd(), 'gtm.config.json');
const AUTO_FIELDS = [
  'accountId',
  'containerId',
  'fingerprint',
  'path',
  'tagId',
  'tagManagerUrl',
  'triggerId',
  'variableId',
  'workspaceId',
];

// 명령행 옵션을 읽어 실행 모드(검사·비교·반영·게시)와 대상 환경을 정한다.
function parseArgs(argv) {
  const args = {
    apply: false,
    env: 'dev',
    publish: false,
    validate: false,
    versionName: '',
    versionNotes: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--') continue;
    if (argument === '--apply') args.apply = true;
    else if (argument === '--publish') {
      args.apply = true;
      args.publish = true;
    } else if (argument === '--version-name') {
      args.versionName = argv[index + 1] ?? '';
      index += 1;
    } else if (argument === '--version-notes') {
      args.versionNotes = argv[index + 1] ?? '';
      index += 1;
    } else if (argument === '--validate') args.validate = true;
    else if (argument === '--help' || argument === '-h') args.help = true;
    else if (argument === '--env') {
      args.env = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`알 수 없는 옵션입니다: ${argument}`);
    }
  }

  return args;
}

// --help 사용법을 출력한다.
function printHelp() {
  console.log(`Bottle Note GTM sync

사용법:
  pnpm gtm:validate
  pnpm gtm:sync -- --env dev
  pnpm gtm:sync -- --env dev --apply
  pnpm gtm:sync -- --env dev --publish --version-name "2026-10-24 요약"

기본 실행은 GTM을 변경하지 않고 생성/수정/삭제 예정 항목만 보여줍니다.
삭제 대상은 'GA4 Event - '·'CE - '·'DLV - ' 이름의 항목 중 설정에 없고 참조되지 않는 것입니다.
--apply를 지정해야 작업공간에 반영하며, 컨테이너 게시는 수행하지 않습니다.
--publish는 반영 후 작업공간 변경을 버전으로 만들어 게시합니다.
gtm.config.json에서 allowPublish가 true인 환경만 게시할 수 있습니다.

인증:
  Application Default Credentials(gcloud 서비스 계정 대행 또는 CI의 Workload Identity Federation)`);
}

// gtm.config.json의 필수 값과 이벤트·매개변수 중복을 검사한다.
function validateConfig(config) {
  const errors = [];
  const eventNames = new Set();

  if (!config.templateEnvironment)
    errors.push('templateEnvironment가 필요합니다.');
  if (!config.templates?.baseTag)
    errors.push('templates.baseTag가 필요합니다.');
  if (!config.templates?.eventTag)
    errors.push('templates.eventTag가 필요합니다.');
  if (!config.templates?.trigger)
    errors.push('templates.trigger가 필요합니다.');
  if (!config.templates?.variable)
    errors.push('templates.variable이 필요합니다.');

  for (const [name, environment] of Object.entries(config.environments ?? {})) {
    if (!environment.accountId) errors.push(`${name}: accountId가 필요합니다.`);
    if (!environment.containerPublicId) {
      errors.push(`${name}: containerPublicId가 필요합니다.`);
    }
    if (!environment.measurementId && !environment.measurementIdEnv) {
      errors.push(`${name}: measurementId 또는 measurementIdEnv가 필요합니다.`);
    }
    if (!environment.baseTagName)
      errors.push(`${name}: baseTagName이 필요합니다.`);
  }

  for (const event of config.events ?? []) {
    if (!event.name) errors.push('이름이 없는 이벤트가 있습니다.');
    if (eventNames.has(event.name)) errors.push(`중복 이벤트: ${event.name}`);
    eventNames.add(event.name);

    if (!Array.isArray(event.parameters)) {
      errors.push(`${event.name}: parameters는 배열이어야 합니다.`);
    } else if (new Set(event.parameters).size !== event.parameters.length) {
      errors.push(`${event.name}: 중복 매개변수가 있습니다.`);
    }
  }

  if (errors.length > 0) throw new Error(errors.join('\n'));
}

// GTM 항목을 복제하면서 GTM이 부여하는 ID·경로 필드를 지운다.
function cloneResource(resource) {
  const clone = structuredClone(resource);
  for (const field of AUTO_FIELDS) delete clone[field];
  return clone;
}

// 지정한 필드만 뽑아 문자열로 만들어 현재 항목과 원하는 항목을 비교할 수 있게 한다.
function comparable(resource, fields) {
  const selected = {};
  for (const field of fields) {
    if (resource[field] !== undefined) selected[field] = resource[field];
  }
  return JSON.stringify(selected);
}

// 템플릿 매개변수 중 key에 해당하는 값을 단일 문자열 값으로 바꾼다.
function setTemplateParameter(parameters, key, value) {
  const parameter = parameters.find((item) => item.key === key);
  if (!parameter)
    throw new Error(`템플릿에서 ${key} 매개변수를 찾지 못했습니다.`);
  parameter.type = 'template';
  parameter.value = value;
  delete parameter.list;
  delete parameter.map;
}

// 태그 종류마다 다른 측정 ID 매개변수를 찾는다.
function findMeasurementParameter(parameters) {
  return parameters.find((parameter) =>
    ['measurementId', 'measurementIdOverride', 'tagId'].includes(parameter.key),
  );
}

// 매개변수 하나를 읽는 데이터 영역 변수(DLV - <name>)를 만든다.
function buildVariable(template, name) {
  const variable = cloneResource(template);
  variable.name = `DLV - ${name}`;
  setTemplateParameter(variable.parameter, 'name', name);
  return variable;
}

// 이벤트 이름으로 발동하는 맞춤 이벤트 트리거(CE - <event>)를 만든다.
function buildTrigger(template, eventName) {
  const trigger = cloneResource(template);
  trigger.name = `CE - ${eventName}`;

  const eventValue = trigger.customEventFilter
    ?.flatMap((condition) => condition.parameter ?? [])
    .find((parameter) => parameter.key === 'arg1');

  if (!eventValue) {
    throw new Error('맞춤 이벤트 트리거 템플릿에서 arg1을 찾지 못했습니다.');
  }
  eventValue.value = eventName;
  return trigger;
}

// 트리거·측정 ID·매개변수를 연결한 GA4 이벤트 태그(GA4 Event - <event>)를 만든다.
function buildEventTag(template, event, measurementId, triggerId) {
  const tag = cloneResource(template);
  tag.name = `GA4 Event - ${event.name}`;
  tag.firingTriggerId = [triggerId];

  setTemplateParameter(tag.parameter, 'eventName', event.name);
  const measurementParameter = findMeasurementParameter(tag.parameter);
  if (!measurementParameter) {
    throw new Error('GA4 이벤트 태그 템플릿에서 측정 ID를 찾지 못했습니다.');
  }
  measurementParameter.value = measurementId;

  const eventParameters = tag.parameter.find((parameter) =>
    ['eventSettingsTable', 'eventParameters'].includes(parameter.key),
  );
  if (event.parameters.length === 0) {
    tag.parameter = tag.parameter.filter(
      (parameter) => parameter !== eventParameters,
    );
    return tag;
  }
  if (!eventParameters) {
    throw new Error(
      'GA4 이벤트 태그 템플릿에서 이벤트 매개변수 설정을 찾지 못했습니다.',
    );
  }
  const isEventSettingsTable = eventParameters.key === 'eventSettingsTable';
  eventParameters.type = 'list';
  eventParameters.list = event.parameters.map((name) => ({
    type: 'map',
    map: [
      {
        type: 'template',
        key: isEventSettingsTable ? 'parameter' : 'name',
        value: name,
      },
      {
        type: 'template',
        key: isEventSettingsTable ? 'parameterValue' : 'value',
        value: `{{DLV - ${name}}}`,
      },
    ],
  }));
  delete eventParameters.value;
  delete eventParameters.map;

  return tag;
}

// 환경별 측정 ID를 넣은 기본 Google 태그를 만든다.
function buildBaseTag(template, name, measurementId) {
  const tag = cloneResource(template);
  tag.name = name;
  const measurementParameter = findMeasurementParameter(tag.parameter);
  if (!measurementParameter) {
    throw new Error('Google 태그 템플릿에서 측정 ID를 찾지 못했습니다.');
  }
  measurementParameter.value = measurementId;
  return tag;
}

// ADC로 인증하고, 요청 한도(429) 시 재시도하는 GTM API 요청 함수를 돌려준다.
async function createApiClient({ publish }) {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    scopes: publish ? [EDIT_SCOPE, ...PUBLISH_SCOPES] : [EDIT_SCOPE],
  });
  let client;

  try {
    client = await auth.getClient();
  } catch (error) {
    throw new Error(
      `Google 인증을 찾지 못했습니다. docs/gtm-sync.md의 인증 준비를 확인하세요.\n${error.message}`,
    );
  }

  return async function request(relativePath, options = {}) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const accessToken = await client.getAccessToken();
      const token =
        typeof accessToken === 'string' ? accessToken : accessToken?.token;
      if (!token) throw new Error('Google 액세스 토큰을 발급받지 못했습니다.');

      const response = await fetch(`${API_BASE}/${relativePath}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // 삭제 응답은 본문이 비어 있다.
      const text = response.status === 204 ? '' : await response.text();
      const body = text ? JSON.parse(text) : null;
      if (response.ok) return body;

      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const waitMs = Math.max(
          Number.isFinite(retryAfter) ? retryAfter * 1000 : 0,
          60_000,
        );
        console.log(
          `GTM API 요청 한도 도달. ${Math.ceil(waitMs / 1000)}초 후 다시 시도합니다.`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      throw new Error(
        `${options.method ?? 'GET'} ${relativePath} 실패 (${response.status})\n${JSON.stringify(body, null, 2)}`,
      );
    }
  };
}

// 공개 컨테이너 ID로 컨테이너를 찾고 동기화할 작업공간을 고른다.
async function resolveWorkspace(api, environment) {
  const containers = await api(`accounts/${environment.accountId}/containers`);
  const container = containers.container?.find(
    (item) => item.publicId === environment.containerPublicId,
  );
  if (!container) {
    throw new Error(
      `컨테이너를 찾지 못했습니다: ${environment.containerPublicId}`,
    );
  }

  const workspaces = await api(`${container.path}/workspaces`);
  let workspace;
  if (environment.workspaceId) {
    workspace = workspaces.workspace?.find(
      (item) => item.workspaceId === environment.workspaceId,
    );
  } else if (workspaces.workspace?.length === 1) {
    [workspace] = workspaces.workspace;
  } else {
    workspace = workspaces.workspace?.find(
      (item) => item.name === 'Default Workspace',
    );
  }

  if (!workspace) {
    const names = workspaces.workspace?.map(
      (item) => `${item.name}(${item.workspaceId})`,
    );
    throw new Error(
      `작업공간을 결정하지 못했습니다: ${names?.join(', ') ?? '없음'}`,
    );
  }
  return workspace;
}

// 작업공간의 변수·트리거·태그를 한 번에 불러온다.
async function listResources(api, workspacePath) {
  const [variables, triggers, tags] = await Promise.all([
    api(`${workspacePath}/variables`),
    api(`${workspacePath}/triggers`),
    api(`${workspacePath}/tags`),
  ]);
  return {
    variables: variables.variable ?? [],
    triggers: triggers.trigger ?? [],
    tags: tags.tag ?? [],
  };
}

// 작업공간 변경 한 건을 "상태 종류 이름" 한 줄로 표시한다.
function describeChange(change) {
  const resource = change.tag ?? change.trigger ?? change.variable;
  const kind = change.tag ? 'tag' : change.trigger ? 'trigger' : 'variable';
  return `${change.changeStatus} ${kind} ${resource?.name ?? '(알 수 없음)'}`;
}

// 충돌이 없으면 작업공간 변경으로 버전을 만들어 게시한다.
async function publishWorkspace(api, workspace, { versionName, versionNotes }) {
  const status = await api(`${workspace.path}/status`);
  const changes = status.workspaceChange ?? [];
  if ((status.mergeConflict ?? []).length > 0) {
    throw new Error('작업공간에 병합 충돌이 있어 게시하지 않았습니다.');
  }
  if (changes.length === 0) {
    console.log('\n게시할 작업공간 변경이 없습니다.');
    return;
  }

  console.log(`\nPUBLISH 작업공간 변경 ${changes.length}건`);
  for (const change of changes) console.log(`  ${describeChange(change)}`);

  const created = await api(`${workspace.path}:create_version`, {
    method: 'POST',
    body: JSON.stringify({ name: versionName, notes: versionNotes }),
  });
  if (created.compilerError || !created.containerVersion) {
    throw new Error('버전 생성 중 컴파일 오류가 발생해 게시하지 않았습니다.');
  }

  const version = created.containerVersion;
  await api(`${version.path}:publish`, { method: 'POST' });
  console.log(
    `게시 완료: 버전 ${version.containerVersionId} "${version.name}"`,
  );
}

// 복제 원본으로 쓸 템플릿 항목을 이름으로 찾고, 없으면 중단한다.
function requireTemplate(resources, kind, name) {
  const resource = resources[kind].find((item) => item.name === name);
  if (!resource) throw new Error(`${kind} 템플릿을 찾지 못했습니다: ${name}`);
  return resource;
}

// 항목 하나를 현재 상태와 비교해 생성·유지·수정하고, 반영 후 모습을 돌려준다.
async function syncOne({
  api,
  apply,
  collection,
  desired,
  existing,
  fields,
  idField,
}) {
  if (!existing) {
    console.log(`CREATE ${collection.padEnd(9)} ${desired.name}`);
    if (!apply) return { ...desired, [idField]: `planned:${desired.name}` };
    return api(`${desired.parent}/${collection}`, {
      method: 'POST',
      body: JSON.stringify(desired.body),
    });
  }

  if (comparable(existing, fields) === comparable(desired.body, fields)) {
    console.log(`KEEP   ${collection.padEnd(9)} ${desired.name}`);
    return existing;
  }

  console.log(`UPDATE ${collection.padEnd(9)} ${desired.name}`);
  if (!apply) return { ...existing, ...desired.body };
  return api(existing.path, {
    method: 'PUT',
    body: JSON.stringify({
      ...desired.body,
      fingerprint: existing.fingerprint,
    }),
  });
}

// 같은 종류(변수·트리거·태그)의 원하는 항목들을 이름으로 짝지어 차례로 동기화한다.
async function syncCollection({
  api,
  apply,
  workspacePath,
  collection,
  desiredItems,
  existingItems,
  fields,
  idField,
}) {
  const results = [];
  for (const body of desiredItems) {
    const existing = existingItems.find((item) => item.name === body.name);
    results.push(
      await syncOne({
        api,
        apply,
        collection,
        desired: { body, name: body.name, parent: workspacePath },
        existing,
        fields,
        idField,
      }),
    );
  }
  return results;
}

const MANAGED_PREFIXES = {
  tags: 'GA4 Event - ',
  triggers: 'CE - ',
  variables: 'DLV - ',
};

// 중첩된 객체·배열 안의 문자열 값을 모두 모은다.
function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value))
    value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object')
    Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

// 남을 항목 중 이 태그·트리거·변수를 참조하는 것이 있는지 확인한다.
function isReferenced(kind, item, remaining) {
  if (kind === 'tags') {
    return remaining.tags.some((tag) =>
      [...(tag.setupTag ?? []), ...(tag.teardownTag ?? [])].some(
        (link) => link.tagName === item.name,
      ),
    );
  }
  if (kind === 'triggers') {
    const byTag = remaining.tags.some((tag) =>
      [
        ...(tag.firingTriggerId ?? []),
        ...(tag.blockingTriggerId ?? []),
      ].includes(item.triggerId),
    );
    const byGroup = remaining.triggers.some(
      (trigger) =>
        trigger.type === 'triggerGroup' &&
        collectStrings(trigger.parameter).includes(item.triggerId),
    );
    return byTag || byGroup;
  }
  const reference = `{{${item.name}}}`;
  return [
    ...remaining.tags,
    ...remaining.triggers,
    ...remaining.variables,
  ].some(
    (resource) =>
      resource !== item &&
      collectStrings(resource).some((text) => text.includes(reference)),
  );
}

// 스크립트가 만든 이름 규칙의 항목 중 설정에서 빠지고 아무도 참조하지 않는 것만 지운다.
async function pruneResources({
  api,
  apply,
  existing,
  desired,
  protectedNames,
}) {
  const candidates = {};
  const remaining = {};
  for (const kind of Object.keys(MANAGED_PREFIXES)) {
    const desiredNames = new Set(desired[kind].map((item) => item.name));
    candidates[kind] = existing[kind].filter(
      (item) =>
        item.name.startsWith(MANAGED_PREFIXES[kind]) &&
        !desiredNames.has(item.name) &&
        !protectedNames.has(item.name),
    );
    // 설정 항목은 반영 후 모습, 그 밖의 항목은 현재 모습으로 참조 여부를 본다.
    remaining[kind] = [
      ...desired[kind],
      ...existing[kind].filter(
        (item) =>
          !desiredNames.has(item.name) && !candidates[kind].includes(item),
      ),
    ];
  }

  // 참조 중인 후보는 남기고, 남긴 항목이 참조하는 후보도 남을 때까지 반복한다.
  let changed = true;
  while (changed) {
    changed = false;
    for (const kind of Object.keys(candidates)) {
      for (const item of [...candidates[kind]]) {
        if (!isReferenced(kind, item, remaining)) continue;
        console.log(`SKIP   ${kind.padEnd(9)} ${item.name} (참조 중)`);
        candidates[kind] = candidates[kind].filter((other) => other !== item);
        remaining[kind].push(item);
        changed = true;
      }
    }
  }

  // 태그 → 트리거 → 변수 순으로 지워 참조 오류를 피한다.
  for (const kind of ['tags', 'triggers', 'variables']) {
    for (const item of candidates[kind]) {
      console.log(`DELETE ${kind.padEnd(9)} ${item.name}`);
      if (apply) await api(item.path, { method: 'DELETE' });
    }
  }
}

// 설정을 읽어 변수 → 트리거 → 태그 순으로 동기화하고, 빠진 항목 정리와 게시까지 진행한다.
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const config = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
  validateConfig(config);
  if (args.validate) {
    const parameterCount = new Set(
      config.events.flatMap((event) => event.parameters),
    ).size;
    console.log(
      `GTM 설정 정상: 이벤트 ${config.events.length}개, 변수 ${parameterCount}개`,
    );
    return;
  }

  const environment = config.environments[args.env];
  if (!environment) throw new Error(`지원하지 않는 환경입니다: ${args.env}`);
  const measurementId =
    environment.measurementId ?? process.env[environment.measurementIdEnv];
  if (!measurementId) {
    throw new Error(`${environment.measurementIdEnv} 환경변수가 필요합니다.`);
  }

  if (args.publish && !environment.allowPublish) {
    throw new Error(
      `${args.env} 환경은 allowPublish가 없어 게시할 수 없습니다. --apply로 반영한 뒤 GTM에서 게시하세요.`,
    );
  }
  if (args.publish && !args.versionName) {
    throw new Error('--publish에는 --version-name이 필요합니다.');
  }

  const api = await createApiClient({ publish: args.publish });
  const workspace = await resolveWorkspace(api, environment);
  const resources = await listResources(api, workspace.path);

  const templateEnvironment = config.environments[config.templateEnvironment];
  let templateResources = resources;
  if (config.templateEnvironment !== args.env) {
    const templateWorkspace = await resolveWorkspace(api, templateEnvironment);
    templateResources = await listResources(api, templateWorkspace.path);
  }

  const variableTemplate = requireTemplate(
    templateResources,
    'variables',
    config.templates.variable,
  );
  const triggerTemplate = requireTemplate(
    templateResources,
    'triggers',
    config.templates.trigger,
  );
  const eventTagTemplate = requireTemplate(
    templateResources,
    'tags',
    config.templates.eventTag,
  );
  const baseTagTemplate = requireTemplate(
    templateResources,
    'tags',
    config.templates.baseTag,
  );

  console.log(
    `${args.apply ? 'APPLY' : 'DRY-RUN'} ${args.env} → ${workspace.path}`,
  );

  const parameterNames = [
    ...new Set(config.events.flatMap((event) => event.parameters)),
  ].sort();
  const variables = await syncCollection({
    api,
    apply: args.apply,
    workspacePath: workspace.path,
    collection: 'variables',
    desiredItems: parameterNames.map((name) =>
      buildVariable(variableTemplate, name),
    ),
    existingItems: resources.variables,
    fields: ['name', 'type', 'parameter'],
    idField: 'variableId',
  });

  const triggers = await syncCollection({
    api,
    apply: args.apply,
    workspacePath: workspace.path,
    collection: 'triggers',
    desiredItems: config.events.map((event) =>
      buildTrigger(triggerTemplate, event.name),
    ),
    existingItems: resources.triggers,
    fields: ['name', 'type', 'customEventFilter', 'filter', 'parameter'],
    idField: 'triggerId',
  });
  const triggerByName = new Map(
    triggers.map((trigger) => [trigger.name, trigger]),
  );

  const eventTags = config.events.map((event) => {
    const trigger = triggerByName.get(`CE - ${event.name}`);
    return buildEventTag(
      eventTagTemplate,
      event,
      measurementId,
      trigger.triggerId,
    );
  });
  const baseTag = buildBaseTag(
    baseTagTemplate,
    environment.baseTagName,
    measurementId,
  );
  const tags = await syncCollection({
    api,
    apply: args.apply,
    workspacePath: workspace.path,
    collection: 'tags',
    desiredItems: [baseTag, ...eventTags],
    existingItems: resources.tags,
    fields: ['name', 'type', 'parameter', 'firingTriggerId'],
    idField: 'tagId',
  });

  await pruneResources({
    api,
    apply: args.apply,
    existing: resources,
    desired: { tags, triggers, variables },
    protectedNames: new Set([
      environment.baseTagName,
      ...Object.values(config.templates),
    ]),
  });

  if (args.publish) {
    await publishWorkspace(api, workspace, args);
    return;
  }

  console.log(
    args.apply
      ? '\n작업공간 반영 완료. GTM 미리보기로 검증한 뒤 UI에서 게시하세요.'
      : '\n변경하지 않았습니다. 확인 후 같은 명령에 --apply를 추가하세요.',
  );
}

main().catch((error) => {
  console.error(`\nGTM 동기화 실패\n${error.message}`);
  process.exitCode = 1;
});
