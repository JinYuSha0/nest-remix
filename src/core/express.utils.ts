let stacks = [];

function getPathFromRegex(regexp) {
  return regexp
    .toString()
    .replace("/^", "")
    .replace("?(?=\\/|$)/i", "")
    .replace(/\\\//g, "/")
    .replace("(?:/(?=$))", "");
}

function combineStacks(acc, stack) {
  if (stack.handle.stack) {
    const routerPath = getPathFromRegex(stack.regexp);
    return [
      ...acc,
      ...stack.handle.stack.map((stack) => ({ routerPath, ...stack })),
    ];
  }
  return [...acc, stack];
}

function getStacks(app) {
  // Express 3
  if (app.routes) {
    // convert to express 4
    return Object.keys(app.routes)
      .reduce((acc, method) => [...acc, ...app.routes[method]], [])
      .map((route) => ({ route: { stack: [route] } }));
  }

  // Express 4
  if (app._router && app._router.stack) {
    return app._router.stack.reduce(combineStacks, []);
  }

  // Express 4 Router
  if (app.stack) {
    return app.stack.reduce(combineStacks, []);
  }

  // Express 5
  if (app.router && app.router.stack) {
    return app.router.stack.reduce(combineStacks, []);
  }

  return [];
}

export function setExpressApp(app) {
  stacks = getStacks(app);
}

export function hasAnotherMatch(req) {
  if (!stacks.length) return false;
  for (let layer of stacks) {
    if (
      layer.regexp &&
      layer.regexp.test(req.path) &&
      !layer.regexp.test("/") &&
      layer.route.methods[String(req.method).toLocaleLowerCase()]
    ) {
      return true;
    }
  }
  return false;
}
