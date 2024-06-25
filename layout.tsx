export const metadata = {
  title: '2 School',
  description: 'Created by Trent Annan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
