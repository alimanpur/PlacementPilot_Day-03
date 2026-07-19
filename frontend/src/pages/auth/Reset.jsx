import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthShell } from '@/layouts/AuthShell'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import { useResetPassword } from '@/hooks/api'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

export default function Reset() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const resetPasswordMutation = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    resetPasswordMutation.mutate(
      { token: token || '', password: data.password },
      {
        onSuccess: () => {
          navigate('/sign-in')
        },
      },
    )
  }

  return (
    <PageTransition>
      <AuthShell
        eyebrow="Recovery"
        title="Set a new password."
        subtitle="Choose something at least 8 characters."
        footer={
          <Link to="/sign-in" className="text-brand hover:underline">
            ← Sign in instead
          </Link>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="New password" error={errors.password?.message} required>
            <Input
              type="password"
              error={!!errors.password}
              disabled={resetPasswordMutation.isPending}
              {...register('password')}
            />
          </FormField>
          <FormField label="Confirm password" error={errors.confirm?.message} required>
            <Input
              type="password"
              error={!!errors.confirm}
              disabled={resetPasswordMutation.isPending}
              {...register('confirm')}
            />
          </FormField>
          <Button variant="primary" size="lg" loading={resetPasswordMutation.isPending} className="w-full">
            {resetPasswordMutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </AuthShell>
    </PageTransition>
  )
}