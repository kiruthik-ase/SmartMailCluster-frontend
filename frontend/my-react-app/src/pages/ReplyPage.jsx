import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/api';

function ReplyPage() {
  const { id } = useParams();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { parent_email: parseInt(id) } });

  const onSubmit = data => {
    api.post('reply/', data)
      .then(res => {
        alert(res.data.message);
        reset();
      })
      .catch(err => alert('Error: ' + (err.response?.data?.error || err.message)));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reply to Email {id}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('parent_email')} />
        <input {...register('sender')} placeholder="Sender (e.g., bob@example.com)" className="p-2 border w-full" required />
        <input {...register('receiver')} placeholder="Receiver (e.g., alice@example.com)" className="p-2 border w-full" required />
        <textarea {...register('body')} placeholder="Body" className="p-2 border w-full h-32" required />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Reply</button>
      </form>
    </div>
  );
}

export default ReplyPage;