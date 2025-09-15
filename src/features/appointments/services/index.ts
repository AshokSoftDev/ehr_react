import axios from 'axios';

const API_URL = 'http://localhost:3000/api/appointments';

export const getAppointments = async () => {
  return axios.get(API_URL);
};

export const getAppointment = async (id: string) => {
  return axios.get(`${API_URL}/${id}`);
};
