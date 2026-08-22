import { BirthdayCake } from '@/components/features/BirthdayCake'

export default function TestCakePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          🎂 ケーキテストページ
        </h1>

        <div className="max-w-4xl mx-auto">
          <BirthdayCake candleCount={5} />
        </div>

        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p>マイクを有効にして吹くか、ボタンをクリックしてろうそくを消してください</p>
        </div>
      </div>
    </main>
  )
}
