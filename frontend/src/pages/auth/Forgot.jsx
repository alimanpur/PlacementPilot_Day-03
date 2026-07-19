import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthShell } from '@/layouts/AuthShell'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import { useForgotPassword } from '@/hooks/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function Forgot() {
  const [sent, setSent] = useState(false)
  const forgotPasswordMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setSent(true)
      },
    })
  }

  return (
    <PageTransition>
      <AuthShell
        eyebrow="Recovery"
        title={sent ? 'Signal transmitted.' : 'Reset your access.'}
        subtitle={
          sent
            ? 'Check your inbox for a secure link. It expires in 30 minutes.'
            : "Enter the email you registered with. We'll send a recovery link."
        }
        footer={
          <Link to="/sign-in" className="text-brand hover:underline">
            ← Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div className="ring-hairline bg-surface rounded-md p-4 text-sm text-ink-2">
            If <span className="text-ink font-mono">your@email.edu</span> is registered, a link is
            on its way.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Email" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="you@school.edu"
                error={!!errors.email}
                disabled={forgotPasswordMutation.isPending}
                {...register('email')}
              />
            </FormField>
            <Button variant="primary" size="lg" loading={forgotPasswordMutation.isPending} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </AuthShell>
    </PageTransition>
  )
}