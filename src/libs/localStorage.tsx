export const getPlayStateFromLocal = () => {
  const state = localStorage.getItem("play");
  return state === "true";
};

export const setPlayStateToLocal = (state: boolean) => {
  localStorage.setItem("play", state.toString());
};
