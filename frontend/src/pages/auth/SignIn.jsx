import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthShell } from '@/layouts/AuthShell'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import { useLogin } from '@/hooks/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function SignIn() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate('/app')
      },
    })
  }

  return (
    <PageTransition>
      <AuthShell
        eyebrow="Boarding"
        title="Welcome back, captain."
        subtitle="Sign in to resume your approach."
        footer={
          <>
            New here?{' '}
            <Link to="/sign-up" className="text-brand hover:underline">
              Create an account →
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="you@school.edu"
              error={!!errors.email}
              disabled={loginMutation.isPending}
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Password"
            error={errors.password?.message}
            hint={
              <Link to="/forgot" className="text-brand hover:underline">
                Forgot?
              </Link>
            }
            required
          >
            <Input
              type="password"
              error={!!errors.password}
              disabled={loginMutation.isPending}
              {...register('password')}
            />
          </FormField>

          <Button variant="primary" size="lg" loading={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? 'Authenticating…' : 'Sign in'}
          </Button>

        </form>
      </AuthShell>
    </PageTransition>
  )
}