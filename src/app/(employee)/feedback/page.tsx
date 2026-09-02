'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Card from '@/components/common/Card';
import { auth, db } from '@/lib/firebase';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResubmitPromptOpen, setIsResubmitPromptOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'validation-error' | 'auth-error' | 'submit-error'>('idle');

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setIsAuthReady(true);

    if (!user) {
      setIsFormOpen(true);
      return;
    }

    void getDoc(doc(db, 'user', user.uid)).then((userSnapshot) => {
      setIsFormOpen(userSnapshot.data()?.feedbackClosed !== true);
    }).catch((error) => {
      console.error('Failed to load feedback preference', error);
      setIsFormOpen(true);
    });
  }), []);

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    const user = auth.currentUser;

    if (!trimmedMessage || rating === 0) {
      setStatus('validation-error');
      return;
    }

    if (!user) {
      setStatus('auth-error');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const userSnapshot = await getDoc(doc(db, 'user', user.uid));
      const profileName = String(userSnapshot.data()?.name ?? '').trim();
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: profileName || user.email || 'Employee',
        message: trimmedMessage,
        rating,
        createdAt: serverTimestamp(),
      });
      setMessage('');
      setRating(0);
      setStatus('success');
      setIsFormOpen(false);
      setIsResubmitPromptOpen(true);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      setStatus('submit-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback</h1>
        <p className="mt-2 text-slate-600">Share your feedback to help us improve.</p>
      </div>

      {isFormOpen ? <Card className="p-5 md:p-6">
        <form className="space-y-6" onSubmit={submitFeedback}>
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-semibold text-slate-900">
              Your message
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what is working well or what we can improve."
              rows={6}
              maxLength={1000}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <p className="mt-1 text-right text-xs text-slate-500">{message.length}/1000</p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-900">Your rating</legend>
            <div className="mt-2 flex items-center gap-1" aria-label="Choose a rating from 1 to 5 stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded p-1 text-slate-300 transition hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  aria-pressed={rating === value}
                >
                  <Star className={rating >= value ? 'h-8 w-8 fill-amber-400 text-amber-400' : 'h-8 w-8'} />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-600">{rating ? `${rating} of 5` : 'Select 1 to 5'}</span>
            </div>
          </fieldset>

          {status === 'validation-error' ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Enter a message and select a rating before submitting.</p> : null}
          {status === 'auth-error' ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Your sign-in session is unavailable. Log in again, then submit your feedback.</p> : null}
          {status === 'submit-error' ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">We could not submit your feedback. Check your connection and Firestore rules, then try again.</p> : null}

          <button className="btn-primary w-full sm:w-auto" type="submit" disabled={isSubmitting || !isAuthReady}>
            {isSubmitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
      </Card> : (
        <Card className="p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Thank you for your feedback.</p>
          <p className="mt-2 text-sm text-slate-600">Your response has been submitted successfully.</p>
        </Card>
      )}

      {isResubmitPromptOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" role="dialog" aria-modal="true" aria-labelledby="resubmit-feedback-title">
          <Card className="w-full max-w-sm p-6 shadow-xl">
            <h2 id="resubmit-feedback-title" className="text-lg font-bold text-slate-900">Submit another feedback?</h2>
            <p className="mt-2 text-sm text-slate-600">Would you like to send another message and rating?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsResubmitPromptOpen(false); if (auth.currentUser) { void updateDoc(doc(db, 'user', auth.currentUser.uid), { feedbackClosed: true }); } }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">No, I&apos;m done</button>
              <button type="button" onClick={() => { setStatus('idle'); setIsFormOpen(true); setIsResubmitPromptOpen(false); if (auth.currentUser) { void updateDoc(doc(db, 'user', auth.currentUser.uid), { feedbackClosed: false }); } }} className="btn-primary">Yes, submit another</button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
