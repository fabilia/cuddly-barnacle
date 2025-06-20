import React, { useRef, useMemo, useEffect } from "react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { createSlice, configureStore } from "@reduxjs/toolkit";
import styled from "styled-components";

// Initial timer state
const initialState = {
  isRunning: false,
  startTime: 10,
  currentTime: 10,
  duration: 1000,
};

const palette = ["hotpink", "aquamarine", "coral", "cyan"];

// Timer slice with 6 required actions
const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    reset(state) {
      state.currentTime = state.startTime;
      state.isRunning = false;
    },
    start(state) {
      state.isRunning = true;
    },
    stop(state) {
      state.isRunning = false;
    },
    tick(state) {
      if (state.currentTime > 0) {
        state.currentTime -= 1;
        if (state.currentTime === 0) {
          state.isRunning = false;
        }
      }
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    setStartTime(state, action) {
      state.startTime = action.payload;
      state.currentTime = action.payload;
    },
  },
});

// Export actions
const {
  reset,
  start,
  stop,
  tick,
  setDuration,
  setStartTime,
} = timerSlice.actions;

// Create the Redux store
const store = configureStore({
  reducer: timerSlice.reducer,
});

// App wrapper with Redux Provider
export default function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

// Selectors
const durationSelector = (state) => state.duration;
const currentTimeSelector = (state) => state.currentTime;
const isRunningSelector = (state) => state.isRunning;
const startTimeSelector = (state) => state.startTime;

// Timer component
function Counter() {
  const startTimeInputRef = useRef();
  const durationInputRef = useRef();

  const dispatch = useDispatch();

  const duration = useSelector(durationSelector);
  const currentTime = useSelector(currentTimeSelector);
  const isRunning = useSelector(isRunningSelector);
  const startTime = useSelector(startTimeSelector);

  const handleStop = () => dispatch(stop());
  const handleReset = () => dispatch(reset());
  const handleStart = () => dispatch(start());

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      dispatch(tick());
    }, duration);

    return () => clearInterval(intervalId);
  }, [dispatch, duration, isRunning]);

  const isResetted = useMemo(() => currentTime === startTime, [
    startTime,
    currentTime,
  ]);

  const isDone = useMemo(() => currentTime === 0, [currentTime]);

  return (
    <Container>
      <Time duration={duration} currentTime={currentTime} stopped={!isRunning}>
        {currentTime}
      </Time>

      <Button onClick={handleStop} disabled={!isRunning}>
        Stop
      </Button>

      <Button onClick={handleReset} disabled={isRunning || isResetted}>
        Reset
      </Button>

      <Button onClick={handleStart} disabled={isRunning || isDone}>
        Start
      </Button>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const durationVal = Number(durationInputRef.current.value);
          dispatch(setDuration(durationVal));
          dispatch(reset());
        }}
      >
        <label htmlFor="duration">Duration(ms)</label>
        <input
          ref={durationInputRef}
          id="duration"
          type="text"
          name="duration"
          defaultValue={duration}
        />
        <input type="submit" value="Set" disabled={isRunning} />
      </Form>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const startTimeVal = Number(startTimeInputRef.current.value);
          dispatch(setStartTime(startTimeVal));
          dispatch(reset());
        }}
      >
        <label htmlFor="start-time">Start Time(sec)</label>
        <input
          ref={startTimeInputRef}
          id="start-time"
          type="text"
          name="start-time"
          defaultValue={startTime}
        />
        <input type="submit" value="Set" disabled={isRunning} />
      </Form>
    </Container>
  );
}

// Styled Components
const Button = styled.button`
  display: block;
  padding: 8px;
  margin: 4px 0;
`;

const Time = styled.div`
  box-sizing: border-box;
  margin: 12px 0;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 100%;
  transition: background-color ${({ duration }) => duration}ms;
  background-color: ${({ currentTime }) =>
    palette[currentTime % palette.length]};
  font-size: 2rem;
  font-weight: bold;
  color: black;
  opacity: ${({ stopped }) => (stopped ? 0.4 : 1)};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  margin-top: 8px;

  label {
    display: inline-block;
    min-width: 120px;
  }

  input[type="text"] {
    margin-right: 8px;
  }
`;
