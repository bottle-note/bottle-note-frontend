function handleWebViewMessage(payload: any) {
  return window.FlutterMessageQueue.postMessage(payload);
}

export default handleWebViewMessage;
