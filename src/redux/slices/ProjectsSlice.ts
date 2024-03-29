import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { SentryItem } from "../../model/issue";
import { IssueErrorPayload, Project } from "../../model/project";
import format from "pretty-format";

interface ProjectsState {
  // data: { errors: SentryIssue[]; issues: SentryIssue[] };
  projects: Project[];
  loading: boolean;
  projectsLoading: boolean;
  error: string | null;
  projectsError: any;
}

const initialState: ProjectsState = {
  // data: { errors: [], issues: [] },
  projects: [],
  loading: false,
  projectsLoading: false,
  error: null,
  projectsError: null,
};

const projectUrls: { [key: string]: string } = {
  "urban-ai": "https://urbanai.info",
  portfolio: "https://kareemsaygbe.dev",
  vournal: "https://vournal-b93307c9ab1a.herokuapp.com",
};

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    addIssue: (state, action: PayloadAction<IssueErrorPayload>) => {
      const { projectId, item } = action.payload;
      const project = state.projects.find(
        (project) => project.id === projectId
      );

      if (project) {
        project.issues.push(item);
      }
    },
    addError: (state, action: PayloadAction<IssueErrorPayload>) => {
      const { projectId, item } = action.payload;
      const project = state.projects.find(
        (project) => project.id === projectId
      );
      if (project) {
        project.errors.push(item);
      }
    },
    // addProjectIssue: (state, action) => {

    // },
    clearData: (state) => {
      state.projects.forEach((project) => {
        project.errors = [];
        project.issues = [];
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing cases for fetchIssues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIssues.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjects.pending, (state) => {
        state.projectsLoading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload;
        state.projectsLoading = false;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.projectsLoading = false;
        state.projectsError = action.payload;
      })
      .addCase(checkServerStatus.fulfilled, (state, action) => {
        state.projects = action.payload;
      });
  },
});

// Async thunk for fetching issues
export const fetchIssues = createAsyncThunk<
  void, // Type for returned value
  string, // Type for projectName argument
  { rejectValue: string } // Type for thunkAPI (customize as needed)
>("issues/fetchIssues", async (projectName, thunkAPI) => {
  try {
    const response = await axios.get(
      `https://sentry.io/api/0/projects/communite/${projectName}/issues/`,
      {
        headers: {
          Authorization:
            "Bearer 6e639307dff6ddc655a74d16f040d9e88c29ea9c151bc60b7ee5f819b19252b4",
        },
      }
    );

    // Ensure the initial accumulator matches the Accumulator interface

    // thunkAPI.dispatch(issuesSlice.actions.clearData());

    // Sequentially fetch events for each issue before categorizing
    response.data.forEach(async (issue: SentryItem) => {
      // console.log("🚀 ~ response.data.forEach ~ issue:", format(issue));

      const eventActionResult = await thunkAPI.dispatch(
        fetchEvent({ issueId: issue.id, projectId: issue.project.id })
      );

      if (fetchEvent.fulfilled.match(eventActionResult)) {
        const events = eventActionResult.payload.events;
        const issueWithEvents = { ...issue, events: events };

        // Dispatch action to add issue or error to the state
        try {
          if (issue.level === "error") {
            thunkAPI.dispatch(
              issuesSlice.actions.addError({
                projectId: issue.project.id,
                item: issueWithEvents,
              })
            );
          } else {
            thunkAPI.dispatch(
              issuesSlice.actions.addIssue({
                projectId: issue.project.id, // This should be dynamically determined based on your app's logic
                item: issueWithEvents,
              })
            );
          }
        } catch (e) {
          console.log(e);
        }
      }
    });

    // No need to return a payload as we're updating the state incrementally
  } catch (error: any) {
    console.error(
      "Error fetching issues:",
      error.response?.data || error.message
    );
    return thunkAPI.rejectWithValue(
      error.response?.data || "An error occurred"
    );
  }
});

export const fetchProjects = createAsyncThunk(
  "issues/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://sentry.io/api/0/organizations/communite/projects/",
        {
          headers: {
            Authorization:
              "Bearer 6e639307dff6ddc655a74d16f040d9e88c29ea9c151bc60b7ee5f819b19252b4",
          },
        }
      );

      const projectsWithIssuesAndErrors = response.data.map(
        (project: { issues: any; errors: any }) => ({
          ...project,
          issues: project.issues || [],
          errors: project.errors || [],
        })
      );
      return projectsWithIssuesAndErrors;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchEvent = createAsyncThunk(
  "issues/fetchEvent",
  async (
    { issueId, projectId }: { issueId: string; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `https://sentry.io/api/0/organizations/communite/issues/${issueId}/events/`,
        {
          headers: {
            Authorization:
              "Bearer 6e639307dff6ddc655a74d16f040d9e88c29ea9c151bc60b7ee5f819b19252b4",
          },
        }
      );
      // console.log("🚀 ~ response:", format(response.data));
      // console.log("EVENTS:", { issueId, events: response.data });

      return { issueId, events: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "An error occurred while fetching events"
      );
    }
  }
);

export const checkServerStatus = createAsyncThunk(
  "issues/checkServerStatus",
  async (projects: Project[], { rejectWithValue }) => {
    try {
      const updatedProjects = await Promise.all(
        projects.map(async (project) => {
          // const url = projectUrls[project.name];
          // if (!url) {
          //   return { ...project, serverStatus: "down" }; // Mark as down if URL not found
          // }
          // try {
          //   await axios.get(url);
          return { ...project, serverStatus: "live" };
          // } catch {
          //   return { ...project, serverStatus: "down" };
          // }
        })
      );
      return updatedProjects;
    } catch (error: any) {
      return rejectWithValue("Failed to check server status");
    }
  }
);

export default issuesSlice.reducer;
