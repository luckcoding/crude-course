import React from 'react';
import defaultsDeep from 'lodash.defaultsdeep';
import hoistNonReactStatics from 'hoist-non-react-statics';
import handleStates from './handleStates';

/**
 * example
 *
 * @Course({
 *   [effect]: {
 *     async exec([arg1,arg2], props) {
 *       console.log(props)
 *       await request({ arg1, arg2 }).result()
 *     },
 *     fail(err) {
 *       console.error(err)
 *     },
 *     done(resp) {
 *       console.log(resp)
 *     }
 *   }
 * }, {
 *   fail(err) {
 *     console.error(err)
 *   }
 * })
 */
export default (models, middle) => (Comp) => {
  class Course extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = this.injecter();
      this.updateStates = this.updateStates.bind(this);
      this.getExec = this.getExec.bind(this);
      this.injecter = this.injecter.bind(this);
    }

    getExec(effect) {
      return this.state[effect].exec;
    }

    updateStates(effect, state = {}) {
      const nextState = defaultsDeep({ state }, this.state[effect]);
      this.setState({ [effect]: nextState });
    }

    injecter() {
      return handleStates.bind(this)(models, middle);
    }

    render() {
      return <Comp {...this.props} courses={this.state} />;
    }
  }

  Course.displayName = `Connect(${Comp.displayName || Comp.name || 'Comp'})`;

  return hoistNonReactStatics(Course, Comp);
};
