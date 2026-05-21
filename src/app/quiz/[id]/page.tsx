import QuizClient from './QuizClient'

export function generateStaticParams() {
  return [{ id: 'q-mock-1' }]
}

export default function QuizPage() {
  return <QuizClient />
}
