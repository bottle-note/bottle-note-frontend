#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API_BASE = 'https://tagmanager.googleapis.com/tagmanager/v2';
const EDIT_SCOPE = 'https://www.googleapis.com/auth/tagmanager.edit.containers';
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

function parseArgs(argv) {
  const args = { apply: false, env: 'dev', validate: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--') continue;
    if (argument === '--apply') args.apply = true;
    else if (argument === '--validate') args.validate = true;
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

function printHelp() {
  console.log(`Bottle Note GTM sync

사용법:
  pnpm gtm:validate
  pnpm gtm:sync -- --env dev
  pnpm gtm:sync -- --env dev --apply

기본 실행은 GTM을 변경하지 않고 생성/수정 예정 항목만 보여줍니다.
--apply를 지정해야 작업공간에 반영하며, 컨테이너 게시는 수행하지 않습니다.

인증:
  GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json`);
}

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

function cloneResource(resource) {
  const clone = structuredClone(resource);
  for (const field of AUTO_FIELDS) delete clone[field];
  return clone;
}

function comparable(resource, fields) {
  const selected = {};
  for (const field of fields) {
    if (resource[field] !== undefined) selected[field] = resource[field];
  }
  return JSON.stringify(selected);
}

function setTemplateParameter(parameters, key, value) {
  const parameter = parameters.find((item) => item.key === key);
  if (!parameter)
    throw new Error(`템플릿에서 ${key} 매개변수를 찾지 못했습니다.`);
  parameter.type = 'template';
  parameter.value = value;
  delete parameter.list;
  delete parameter.map;
}

function findMeasurementParameter(parameters) {
  return parameters.find((parameter) =>
    ['measurementId', 'measurementIdOverride', 'tagId'].includes(parameter.key),
  );
}

function buildVariable(template, name) {
  const variable = cloneResource(template);
  variable.name = `DLV - ${name}`;
  setTemplateParameter(variable.parameter, 'name', name);
  return variable;
}

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

  const eventParameters = tag.parameter.find(
    (parameter) => parameter.key === 'eventParameters',
  );
  if (!eventParameters) {
    throw new Error(
      'GA4 이벤트 태그 템플릿에서 eventParameters를 찾지 못했습니다.',
    );
  }
  eventParameters.type = 'list';
  eventParameters.list = event.parameters.map((name) => ({
    type: 'map',
    map: [
      { type: 'template', key: 'name', value: name },
      { type: 'template', key: 'value', value: `{{DLV - ${name}}}` },
    ],
  }));
  delete eventParameters.value;
  delete eventParameters.map;

  return tag;
}

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

async function createApiClient() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({ scopes: [EDIT_SCOPE] });
  let client;

  try {
    client = await auth.getClient();
  } catch (error) {
    throw new Error(
      `Google 인증을 찾지 못했습니다. GOOGLE_APPLICATION_CREDENTIALS에 GTM 권한이 있는 서비스 계정 JSON 경로를 지정하세요.\n${error.message}`,
    );
  }

  return async function request(relativePath, options = {}) {
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

    const body = response.status === 204 ? null : await response.json();
    if (!response.ok) {
      throw new Error(
        `${options.method ?? 'GET'} ${relativePath} 실패 (${response.status})\n${JSON.stringify(body, null, 2)}`,
      );
    }
    return body;
  };
}

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

function requireTemplate(resources, kind, name) {
  const resource = resources[kind].find((item) => item.name === name);
  if (!resource) throw new Error(`${kind} 템플릿을 찾지 못했습니다: ${name}`);
  return resource;
}

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

  const api = await createApiClient();
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
  await syncCollection({
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
  await syncCollection({
    api,
    apply: args.apply,
    workspacePath: workspace.path,
    collection: 'tags',
    desiredItems: [baseTag, ...eventTags],
    existingItems: resources.tags,
    fields: ['name', 'type', 'parameter', 'firingTriggerId'],
    idField: 'tagId',
  });

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
