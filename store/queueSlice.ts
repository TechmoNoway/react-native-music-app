import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QueueState {
  activeQueueId: string | null;
}

const initialState: QueueState = {
  activeQueueId: null,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setActiveQueueId: (state, action: PayloadAction<string>) => {
      state.activeQueueId = action.payload;
    },
    clearActiveQueueId: (state) => {
      state.activeQueueId = null;
    },
  },
});

export const { setActiveQueueId, clearActiveQueueId } = queueSlice.actions;
export default queueSlice.reducer;
