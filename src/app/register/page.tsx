import { redirect } from 'next/navigation';

export default function RegisterChooserPage() {
  redirect('/candidate-auth?mode=signup');
}
