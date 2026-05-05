import { redirect } from 'next/navigation';

export default function LegacyClientAuthRedirect() {
  redirect('/candidate-auth');
}
