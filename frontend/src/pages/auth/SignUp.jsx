import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AuthShell } from '@/layouts/AuthShell'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import { useRegister } from '@/hooks/api'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid school email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function SignUp() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate('/welcome')
      },
    })
  }

  return (
    <PageTransition>
      <AuthShell
        eyebrow="Pre-flight"
        title="Initialize your deck."
        subtitle="Two weeks free on Cruise. No credit card. Ejection at any time."
        footer={
          <>
            Already have a deck?{' '}
            <Link to="/sign-in" className="text-brand hover:underline">
              Sign in →
            </Link>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Full name" error={errors.name?.message} required>
            <Input
              placeholder="Alex Rivera"
              error={!!errors.name}
              disabled={registerMutation.isPending}
              {...register('name')}
            />
          </FormField>

          <FormField label="School email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="you@school.edu"
              error={!!errors.email}
              disabled={registerMutation.isPending}
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Password"
            error={errors.password?.message}
            hint="Min. 8 characters"
            required
          >
            <Input
              type="password"
              error={!!errors.password}
              disabled={registerMutation.isPending}
              {...register('password')}
            />
          </FormField>

          <Button variant="primary" size="lg" loading={registerMutation.isPending} className="w-full">
            {registerMutation.isPending ? 'Assembling deck…' : 'Create account'}
          </Button>

          <p className="text-[11px] text-ink-4">
            By continuing you agree to our{' '}
            <Link to="/terms" className="underline hover:text-ink-2">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline hover:text-ink-2">
              Privacy
            </Link>
            .
          </p>
        </form>
      </AuthShell>
    </PageTransition>
  )
}