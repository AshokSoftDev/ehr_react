import { useParams } from 'react-router-dom';
import { useDoctor } from './useDoctor';

export const useDoctorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const doctorHook = useDoctor(id);

  return {
    doctorId: id,
    ...doctorHook,
  };
};
