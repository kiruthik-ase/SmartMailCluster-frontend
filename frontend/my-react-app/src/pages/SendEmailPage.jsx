import { useForm } from 'react-hook-form';
import api from '../api/api';

function SendEmailPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = data => {
    api.post('send/', data)
      .then(res => {
        alert(res.data.message);
        reset();
      })
      .catch(err => alert('Error: ' + (err.response?.data?.error || err.message)));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Send Email</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('sender')} placeholder="Sender (e.g., alice@example.com)" className="p-2 border w-full" required />
        <input {...register('receiver')} placeholder="Receiver (e.g., bob@example.com)" className="p-2 border w-full" required />
        <input {...register('subject')} placeholder="Subject" className="p-2 border w-full" required />
        <textarea {...register('body')} placeholder="Body" className="p-2 border w-full h-32" required />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Send</button>
      </form>
    </div>
  );
}

export default SendEmailPage;