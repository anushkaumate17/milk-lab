import { NotebookObservation, EvaluationScore, UnknownSample } from '../types/lab';
import { UNKNOWN_SAMPLES_PRESETS } from './adulterationData';

const NOTEBOOK_KEY = 'milksafe_3d_notebook_v1';
const HISTORY_KEY = 'milksafe_3d_score_history_v1';
const CURRENT_SAMPLE_KEY = 'milksafe_3d_current_sample_v1';

export const storage = {
  getObservations(): NotebookObservation[] {
    try {
      const data = localStorage.getItem(NOTEBOOK_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveObservation(observation: NotebookObservation) {
    try {
      const list = this.getObservations();
      // Replace if same sample and test already recorded or append
      const filtered = list.filter(o => !(o.sampleId === observation.sampleId && o.testId === observation.testId));
      filtered.unshift(observation);
      localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving observation', e);
    }
  },

  clearObservations() {
    try {
      localStorage.removeItem(NOTEBOOK_KEY);
    } catch (e) {
      console.error(e);
    }
  },

  getScoreHistory(): EvaluationScore[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveScore(score: EvaluationScore) {
    try {
      const history = this.getScoreHistory();
      history.unshift(score);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving score', e);
    }
  },

  getCurrentSample(): UnknownSample {
    try {
      const data = localStorage.getItem(CURRENT_SAMPLE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return UNKNOWN_SAMPLES_PRESETS[0];
  },

  setCurrentSample(sample: UnknownSample) {
    try {
      localStorage.setItem(CURRENT_SAMPLE_KEY, JSON.stringify(sample));
    } catch (e) {
      console.error('Error setting current sample', e);
    }
  }
};
