import { isJson } from '@crude/extras';

export default function handleStates(models, middle = {}) {
  const { updateStates: setState, props, getExec } = this;

  models = typeof models === 'function'
    ? models({ props, setState, getExec })
    : models;

  if (!isJson(models)) {
    throw TypeError('course`s first param must return object !');
  }

  if (!isJson(middle)) {
    throw TypeError('course`s secend param must be object !');
  }

  const $models = {};
  const $middle = {};

  // bind middle
  $middle.exec = function exec(...args) {
    if (typeof middle.exec === 'function') {
      middle.exec.apply(null, args);
    }
  };
  $middle.done = function done(...args) {
    if (typeof middle.done === 'function') {
      middle.done.apply(null, args);
    }
  };
  $middle.fail = function fail(...args) {
    if (typeof middle.fail === 'function') {
      middle.fail.apply(null, args);
    }
  };

  Object.keys(models).forEach((name) => {
    let model = models[name];
    model = isJson(model) ? model : {};

    const state = isJson(model.state) ? model.state : {};

    $models[name] = {
      state: { ...state, _loading: false, _error: null },
      async exec(...args) {
        try {
          if (model.listener) {
            setState(name, { _loading: true });
          }
          // each run
          await $middle.exec.apply(null, args);
          $models[name].done(await model.exec.apply(null, args));
        } catch (e) {
          $models[name].fail(e.message);
        }
      },
      async done(result) {
        if (typeof model.done === 'function') {
          await model.done(result);
        } else {
          await $middle.done(result);
        }
        if (model.listener) {
          setState(name, { _loading: false, _error: '' });
        }
      },
      async fail(error) {
        if (typeof model.fail === 'function') {
          await model.fail(error);
        } else {
          await $middle.fail(error, name);
        }
        if (model.listener) {
          setState(name, { _loading: false, _error: error });
        }
      },
    };
  });

  return $models;
}
