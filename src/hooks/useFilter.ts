import { useReducer } from 'react';

type Action<TState> = {
  type: keyof TState | 'initialize';
  payload: any; // 각 state의 payload 타입이 다른데 이걸 어떻게 추론하지?
};

function reducer<TState>(state: TState, action: Action<TState>): TState {
  const { type, payload } = action;

  if (type === 'initialize') return { ...payload };
  return { ...state, [String(type)]: payload };
}

export const useFilter = <TState>(initialState: TState) => {
  const [state, dispatch] = useReducer(reducer<TState>, initialState);

  const handleFilter = (name: keyof TState, value: string) => {
    if (name) return dispatch({ type: name, payload: value });
  };

  const handleInit = () => {
    dispatch({ type: 'initialize', payload: initialState });
  };

  return {
    state,
    handleFilter,
    handleInit,
  };
};
