import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { toast } from 'sonner'

// Auth hooks
export const useRegister = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.register,
    onSuccess: (response) => {
      const { accessToken, user } = response.data.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }
      queryClient.clear()
      queryClient.setQueryData(['user'], user)
      toast.success(response.data.message || 'Account created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.login,
    onSuccess: (response) => {
      const { accessToken, user } = response.data.data
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }
      queryClient.clear()
      queryClient.setQueryData(['user'], user)
      toast.success('Welcome back, captain.')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken')
      queryClient.clear()
      toast.success('Logged out successfully')
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: api.forgotPassword,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Reset link sent to your email')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: api.resetPassword,
    onSuccess: (response) => {
      toast.success(response.data.message || 'Password updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Password reset failed')
    },
  })
}

// Profile hook — used by AppShell and MobileSidebar to display user name/email
export const useProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.getProfile()
      return response.data.data.user
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Profile hooks — used by Profile page
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    },
  })
}

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Notification preferences updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update notification preferences')
    },
  })
}

export const useProfileSummary = () => {
  return useQuery({
    queryKey: ['profile', 'summary'],
    queryFn: async () => {
      const response = await api.getProfileSummary()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export const useActivityTimeline = (limit = 50) => {
  return useQuery({
    queryKey: ['profile', 'activity', limit],
    queryFn: async () => {
      const response = await api.getActivityTimeline(limit)
      return response.data.data.activities
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useCheckAchievements = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.checkAchievements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'achievements'] })
      toast.success('Achievements checked')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to check achievements')
    },
  })
}

export const useProfileAchievements = () => {
  return useQuery({
    queryKey: ['profile', 'achievements'],
    queryFn: async () => {
      const response = await api.getProfileAchievements()
      return response.data.data.achievements
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export const useDocuments = () => {
  return useQuery({
    queryKey: ['profile', 'documents'],
    queryFn: async () => {
      const response = await api.getDocuments()
      return response.data.data.documents
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'documents'] })
      toast.success('Document uploaded')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload document')
    },
  })
}

export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'documents'] })
      toast.success('Document updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update document')
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'documents'] })
      toast.success('Document deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete document')
    },
  })
}

export const useArchiveDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }) => api.archiveDocument(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'documents'] })
      toast.success('Document archived')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive document')
    },
  })
}

export const useSkills = () => {
  return useQuery({
    queryKey: ['profile', 'skills'],
    queryFn: async () => {
      const response = await api.getSkills()
      return response.data.data.skills
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useCreateSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'skills'] })
      toast.success('Skill added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add skill')
    },
  })
}

export const useUpdateSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'skills'] })
      toast.success('Skill updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update skill')
    },
  })
}

export const useDeleteSkill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'skills'] })
      toast.success('Skill removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove skill')
    },
  })
}

// Dashboard hooks - INSTRUMENTED WITH COMPREHENSIVE LOGGING
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      console.group('[Dashboard] 🔍 useDashboard - Full Runtime Trace')
      console.log('[Dashboard] Step 1: Preparing request to /dashboard/overview')
      
      try {
        console.log('[Dashboard] Step 2: Sending GET request...')
        const response = await api.getDashboardOverview()
        
        console.log('[Dashboard] Step 3: ✅ Request completed')
        console.log('[Dashboard] HTTP Status:', response.status)
        console.log('[Dashboard] Response headers:', response.headers)
        console.log('[Dashboard] Full response body:', JSON.stringify(response.data, null, 2))
        console.log('[Dashboard] Response.data.success:', response.data?.success)
        console.log('[Dashboard] Response.data.message:', response.data?.message)
        console.log('[Dashboard] Response.data.data type:', typeof response.data?.data)
        console.log('[Dashboard] Response.data.data keys:', response.data?.data ? Object.keys(response.data.data) : 'N/A')
        
        const data = response.data.data
        console.log('[Dashboard] Step 4: Extracted data from response.data.data')
        console.log('[Dashboard] Final data to return:', data)
        console.groupEnd()
        
        return data
      } catch (error) {
        console.error('[Dashboard] ❌ Request failed with error:')
        console.error('[Dashboard] Error message:', error.message)
        console.error('[Dashboard] Error code:', error.code)
        console.error('[Dashboard] HTTP Status:', error.response?.status)
        console.error('[Dashboard] Response data:', JSON.stringify(error.response?.data, null, 2))
        console.error('[Dashboard] Response headers:', error.response?.headers)
        console.error('[Dashboard] Full error stack:', error.stack)
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useDashboardActivity = (limit = 20) => {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: async () => {
      console.group('[Dashboard] 🔍 useDashboardActivity - Full Runtime Trace')
      console.log(`[Dashboard] Step 1: Preparing request to /dashboard/activity?limit=${limit || 20}`)
      
      try {
        console.log('[Dashboard] Step 2: Sending GET request...')
        const response = await api.getDashboardActivity(limit)
        
        console.log('[Dashboard] Step 3: ✅ Request completed')
        console.log('[Dashboard] HTTP Status:', response.status)
        console.log('[Dashboard] Full response body:', JSON.stringify(response.data, null, 2))
        console.log('[Dashboard] Response.data.data.activity:', response.data?.data?.activity)
        
        const activity = response.data.data.activity
        console.log('[Dashboard] Step 4: Extracted activity array')
        console.groupEnd()
        
        return activity
      } catch (error) {
        console.error('[Dashboard] ❌ Activity request failed:')
        console.error('[Dashboard] Error message:', error.message)
        console.error('[Dashboard] HTTP Status:', error.response?.status)
        console.error('[Dashboard] Response data:', JSON.stringify(error.response?.data, null, 2))
        console.error('[Dashboard] Full error stack:', error.stack)
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useDashboardReadiness = () => {
  return useQuery({
    queryKey: ['dashboard', 'readiness'],
    queryFn: async () => {
      console.group('[Dashboard] 🔍 useDashboardReadiness - Full Runtime Trace')
      console.log('[Dashboard] Step 1: Preparing request to /dashboard/readiness')
      
      try {
        console.log('[Dashboard] Step 2: Sending GET request...')
        const response = await api.getDashboardReadiness()
        
        console.log('[Dashboard] Step 3: ✅ Request completed')
        console.log('[Dashboard] HTTP Status:', response.status)
        console.log('[Dashboard] Full response body:', JSON.stringify(response.data, null, 2))
        
        const readiness = response.data.data
        console.log('[Dashboard] Step 4: Extracted readiness data')
        console.groupEnd()
        
        return readiness
      } catch (error) {
        console.error('[Dashboard] ❌ Readiness request failed:')
        console.error('[Dashboard] Error message:', error.message)
        console.error('[Dashboard] HTTP Status:', error.response?.status)
        console.error('[Dashboard] Response data:', JSON.stringify(error.response?.data, null, 2))
        console.error('[Dashboard] Full error stack:', error.stack)
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export const useDashboardFocus = () => {
  return useQuery({
    queryKey: ['dashboard', 'focus'],
    queryFn: async () => {
      console.group('[Dashboard] 🔍 useDashboardFocus - Full Runtime Trace')
      console.log('[Dashboard] Step 1: Preparing request to /dashboard/focus')
      
      try {
        console.log('[Dashboard] Step 2: Sending GET request...')
        const response = await api.getDashboardFocus()
        
        console.log('[Dashboard] Step 3: ✅ Request completed')
        console.log('[Dashboard] HTTP Status:', response.status)
        console.log('[Dashboard] Full response body:', JSON.stringify(response.data, null, 2))
        
        const focus = response.data.data.focus
        console.log('[Dashboard] Step 4: Extracted focus array')
        console.groupEnd()
        
        return focus
      } catch (error) {
        console.error('[Dashboard] ❌ Focus request failed:')
        console.error('[Dashboard] Error message:', error.message)
        console.error('[Dashboard] HTTP Status:', error.response?.status)
        console.error('[Dashboard] Response data:', JSON.stringify(error.response?.data, null, 2))
        console.error('[Dashboard] Full error stack:', error.stack)
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

export const useDashboardQuickActions = () => {
  return useQuery({
    queryKey: ['dashboard', 'quick-actions'],
    queryFn: async () => {
      console.group('[Dashboard] 🔍 useDashboardQuickActions - Full Runtime Trace')
      console.log('[Dashboard] Step 1: Preparing request to /dashboard/quick-actions')
      
      try {
        console.log('[Dashboard] Step 2: Sending GET request...')
        const response = await api.getDashboardQuickActions()
        
        console.log('[Dashboard] Step 3: ✅ Request completed')
        console.log('[Dashboard] HTTP Status:', response.status)
        console.log('[Dashboard] Full response body:', JSON.stringify(response.data, null, 2))
        
        const actions = response.data.data.actions
        console.log('[Dashboard] Step 4: Extracted actions array')
        console.groupEnd()
        
        return actions
      } catch (error) {
        console.error('[Dashboard] ❌ Quick-actions request failed:')
        console.error('[Dashboard] Error message:', error.message)
        console.error('[Dashboard] HTTP Status:', error.response?.status)
        console.error('[Dashboard] Response data:', JSON.stringify(error.response?.data, null, 2))
        console.error('[Dashboard] Full error stack:', error.stack)
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Companies hooks
export const useCompanies = (params = {}) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const response = await api.getCompanies(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCompany = (id) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const response = await api.getCompany(id)
      return response.data.data.company
    },
    enabled: !!id,
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Company added to pipeline')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add company')
    },
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Company updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update company')
    },
  })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Company removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete company')
    },
  })
}

export const useArchiveCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }) => api.archiveCompany(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(archived ? 'Company archived' : 'Company unarchived')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive company')
    },
  })
}

export const useRestoreCompany = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.restoreCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Company restored')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to restore company')
    },
  })
}

export const useToggleFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.toggleFavorite,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update favorite')
    },
  })
}

export const useAddCompanyNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addCompanyNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Note added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note')
    },
  })
}

export const useAddCompanyAttachment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addCompanyAttachment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] })
      toast.success('Attachment added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add attachment')
    },
  })
}

export const useRemoveCompanyAttachment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, url }) => api.removeCompanyAttachment(id, url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] })
      toast.success('Attachment removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove attachment')
    },
  })
}

export const useAddCompanyTimeline = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addCompanyTimeline(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.id] })
      toast.success('Timeline entry added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add timeline entry')
    },
  })
}

// Recruiters hooks
export const useCreateRecruiter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }) => api.createRecruiter(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
      toast.success('Recruiter added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add recruiter')
    },
  })
}

export const useUpdateRecruiter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, recruiterId, data }) => api.updateRecruiter(companyId, recruiterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Recruiter updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update recruiter')
    },
  })
}

export const useDeleteRecruiter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, recruiterId }) => api.deleteRecruiter(companyId, recruiterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Recruiter removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove recruiter')
    },
  })
}

// Resources hooks
export const useCreateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }) => api.createResource(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
      toast.success('Resource added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add resource')
    },
  })
}

export const useUpdateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, resourceId, data }) => api.updateResource(companyId, resourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Resource updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update resource')
    },
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, resourceId }) => api.deleteResource(companyId, resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Resource removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove resource')
    },
  })
}

// Hiring Info hooks
export const useCreateHiringInfo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }) => api.createHiringInfo(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
      toast.success('Hiring information added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add hiring information')
    },
  })
}

export const useUpdateHiringInfo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, data }) => api.updateHiringInfo(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Hiring information updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update hiring information')
    },
  })
}

export const useDeleteHiringInfo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (companyId) => api.deleteHiringInfo(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Hiring information removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete hiring information')
    },
  })
}

// Company stats and utilities
export const useCompanyStats = () => {
  return useQuery({
    queryKey: ['companies', 'stats'],
    queryFn: async () => {
      const response = await api.getCompanyStats()
      return response.data.data.stats
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useFavoriteCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'favorites'],
    queryFn: async () => {
      const response = await api.getFavoriteCompanies()
      return response.data.data.companies
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Applications hooks
export const useApplications = (params = {}) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: async () => {
      const response = await api.getApplications(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useApplication = (id) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const response = await api.getApplication(id)
      return response.data.data.application
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create application')
    },
  })
}

export const useUpdateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['applications', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update application')
    },
  })
}

export const useDeleteApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Application deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete application')
    },
  })
}

export const useArchiveApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }) => api.archiveApplication(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Application archived')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive application')
    },
  })
}

export const useRestoreApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.restoreApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Application restored')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to restore application')
    },
  })
}

export const useDuplicateApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.duplicateApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Application duplicated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate application')
    },
  })
}

export const useBulkActionApplications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.bulkActionApplications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Bulk action completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bulk action failed')
    },
  })
}

export const useUpcomingDeadlines = (limit = 10) => {
  return useQuery({
    queryKey: ['applications', 'deadlines', limit],
    queryFn: async () => {
      const response = await api.getUpcomingDeadlines(limit)
      return response.data.data.deadlines
    },
    staleTime: 1000 * 60 * 2,
  })
}

// Interviews hooks
export const useInterviews = (params = {}) => {
  return useQuery({
    queryKey: ['interviews', params],
    queryFn: async () => {
      const response = await api.getInterviews(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useInterview = (id) => {
  return useQuery({
    queryKey: ['interviews', id],
    queryFn: async () => {
      const response = await api.getInterview(id)
      return response.data.data.interview
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  })
}

export const useUpcomingInterviews = (limit = 10) => {
  return useQuery({
    queryKey: ['interviews', 'upcoming', limit],
    queryFn: async () => {
      const response = await api.getUpcomingInterviews(limit)
      return response.data.data.interviews
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const usePastInterviews = (limit = 10) => {
  return useQuery({
    queryKey: ['interviews', 'past', limit],
    queryFn: async () => {
      const response = await api.getPastInterviews(limit)
      return response.data.data.interviews
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useTodayInterviews = () => {
  return useQuery({
    queryKey: ['interviews', 'today'],
    queryFn: async () => {
      const response = await api.getTodayInterviews()
      return response.data.data.interviews
    },
    staleTime: 1000 * 60 * 1,
  })
}

export const useCalendarInterviews = (startDate, endDate) => {
  return useQuery({
    queryKey: ['interviews', 'calendar', startDate, endDate],
    queryFn: async () => {
      const response = await api.getCalendarInterviews(startDate, endDate)
      return response.data.data.interviews
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 2,
  })
}

export const usePendingFeedbackInterviews = (limit = 20) => {
  return useQuery({
    queryKey: ['interviews', 'pending-feedback', limit],
    queryFn: async () => {
      const response = await api.getPendingFeedbackInterviews(limit)
      return response.data.data.interviews
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useInterviewDashboardStats = () => {
  return useQuery({
    queryKey: ['interviews', 'dashboard-stats'],
    queryFn: async () => {
      const response = await api.getInterviewDashboardStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCreateInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Interview scheduled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to schedule interview')
    },
  })
}

export const useUpdateInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateInterview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update interview')
    },
  })
}

export const useDeleteInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete interview')
    },
  })
}

export const useArchiveInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archived }) => api.archiveInterview(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview archived')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to archive interview')
    },
  })
}

export const useRestoreInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.restoreInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview restored')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to restore interview')
    },
  })
}

export const useDuplicateInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.duplicateInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview duplicated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate interview')
    },
  })
}

export const useRescheduleInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.rescheduleInterview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview rescheduled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reschedule interview')
    },
  })
}

export const useCancelInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.cancelInterview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview cancelled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel interview')
    },
  })
}

export const useCompleteInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.completeInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Interview marked complete')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete interview')
    },
  })
}

export const useSubmitInterviewFeedback = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.submitInterviewFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Feedback submitted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback')
    },
  })
}

export const useAddInterviewNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addInterviewNote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Note added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add note')
    },
  })
}

export const useAddInterviewAttachment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addInterviewAttachment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Attachment added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add attachment')
    },
  })
}

export const useRemoveInterviewAttachment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, url }) => api.removeInterviewAttachment(id, url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Attachment removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove attachment')
    },
  })
}

export const useAddChecklistItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addChecklistItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Checklist item added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add checklist item')
    },
  })
}

export const useToggleChecklistItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.toggleChecklistItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Checklist item updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle checklist item')
    },
  })
}

export const useRemoveChecklistItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, itemId }) => api.removeChecklistItem(id, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Checklist item removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove checklist item')
    },
  })
}

export const useUpdateInterviewPreparation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateInterviewPreparation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Preparation updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update preparation')
    },
  })
}

export const useAddInterviewer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.addInterviewer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Interviewer added')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add interviewer')
    },
  })
}

export const useRemoveInterviewer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, interviewerId }) => api.removeInterviewer(id, interviewerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews', variables.id] })
      toast.success('Interviewer removed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove interviewer')
    },
  })
}

export const useBulkActionInterviews = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.bulkActionInterviews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Bulk action completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bulk action failed')
    },
  })
}

// DSA hooks
export const useDsaTopics = () => {
  return useQuery({
    queryKey: ['dsa', 'topics'],
    queryFn: async () => {
      const response = await api.getDsaTopics()
      return response.data.data.topics
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCreateDsaTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createDsaTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'topics'] })
      toast.success('Topic created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create topic')
    },
  })
}

export const useUpdateDsaTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDsaTopic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'topics'] })
      toast.success('Topic updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update topic')
    },
  })
}

export const useDeleteDsaTopic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDsaTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'topics'] })
      toast.success('Topic deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete topic')
    },
  })
}

export const useLogDsaProblem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.logDsaProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'topics'] })
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      queryClient.invalidateQueries({ queryKey: ['dsa', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Problem logged')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to log problem')
    },
  })
}

export const useDsaProblems = (params = {}) => {
  return useQuery({
    queryKey: ['dsa', 'problems', params],
    queryFn: async () => {
      const response = await api.getDsaProblems(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaProblem = (id) => {
  return useQuery({
    queryKey: ['dsa', 'problems', id],
    queryFn: async () => {
      const response = await api.getDsaProblem(id)
      return response.data.data.problem
    },
    enabled: !!id,
  })
}

export const useUpdateDsaProblem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDsaProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Problem updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update problem')
    },
  })
}

export const useDeleteDsaProblem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDsaProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Problem deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete problem')
    },
  })
}

export const useBulkUpdateDsaProblems = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.bulkUpdateDsaProblems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Problems updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update problems')
    },
  })
}

export const useToggleDsaFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.toggleDsaFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Favorite toggled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle favorite')
    },
  })
}

export const useToggleDsaBookmark = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.toggleDsaBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Bookmark toggled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle bookmark')
    },
  })
}

export const useToggleDsaStar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.toggleDsaStar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'problems'] })
      toast.success('Star toggled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to toggle star')
    },
  })
}

export const useDsaBookmarks = (params = {}) => {
  return useQuery({
    queryKey: ['dsa', 'bookmarks', params],
    queryFn: async () => {
      const response = await api.getDsaBookmarks(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaFavorites = (params = {}) => {
  return useQuery({
    queryKey: ['dsa', 'favorites', params],
    queryFn: async () => {
      const response = await api.getDsaFavorites(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaStats = () => {
  return useQuery({
    queryKey: ['dsa', 'stats'],
    queryFn: async () => {
      const response = await api.getDsaStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaDashboardStats = () => {
  return useQuery({
    queryKey: ['dsa', 'dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.getDsaDashboardStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaRevisionQueue = () => {
  return useQuery({
    queryKey: ['dsa', 'revision', 'queue'],
    queryFn: async () => {
      const response = await api.getDsaRevisionQueue()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaInsights = () => {
  return useQuery({
    queryKey: ['dsa', 'insights'],
    queryFn: async () => {
      const response = await api.getDsaInsights()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaHeatmap = (days = 84) => {
  return useQuery({
    queryKey: ['dsa', 'heatmap', days],
    queryFn: async () => {
      const response = await api.getDsaHeatmap(days)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaStreak = () => {
  return useQuery({
    queryKey: ['dsa', 'streak'],
    queryFn: async () => {
      const response = await api.getDsaStreak()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaWeakTopics = (limit = 5) => {
  return useQuery({
    queryKey: ['dsa', 'weak-topics', limit],
    queryFn: async () => {
      const response = await api.getDsaWeakTopics(limit)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaStrongTopics = (limit = 5) => {
  return useQuery({
    queryKey: ['dsa', 'strong-topics', limit],
    queryFn: async () => {
      const response = await api.getDsaStrongTopics(limit)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaCompanyReadiness = (companyName) => {
  return useQuery({
    queryKey: ['dsa', 'company-readiness', companyName],
    queryFn: async () => {
      const response = await api.getDsaCompanyReadiness(companyName)
      return response.data.data
    },
    enabled: !!companyName,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaRecommendedProblems = (topics, limit = 10) => {
  return useQuery({
    queryKey: ['dsa', 'recommended', topics, limit],
    queryFn: async () => {
      const response = await api.getDsaRecommendedProblems(topics, limit)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaTrends = (months = 6) => {
  return useQuery({
    queryKey: ['dsa', 'trends', months],
    queryFn: async () => {
      const response = await api.getDsaTrends(months)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Sessions hooks
export const useCreateDsaSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createDsaSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['dsa', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Session started')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start session')
    },
  })
}

export const useDsaSessions = (params = {}) => {
  return useQuery({
    queryKey: ['dsa', 'sessions', params],
    queryFn: async () => {
      const response = await api.getDsaSessions(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaSession = (id) => {
  return useQuery({
    queryKey: ['dsa', 'sessions', id],
    queryFn: async () => {
      const response = await api.getDsaSession(id)
      return response.data.data.session
    },
    enabled: !!id,
  })
}

export const useUpdateDsaSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDsaSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'sessions'] })
      toast.success('Session updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update session')
    },
  })
}

export const useEndDsaSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.endDsaSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['dsa', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Session ended')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to end session')
    },
  })
}

export const useDeleteDsaSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDsaSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'sessions'] })
      toast.success('Session deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete session')
    },
  })
}

// Roadmaps hooks
export const useCreateDsaRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createDsaRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'roadmaps'] })
      toast.success('Roadmap created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create roadmap')
    },
  })
}

export const useDsaRoadmaps = () => {
  return useQuery({
    queryKey: ['dsa', 'roadmaps'],
    queryFn: async () => {
      const response = await api.getDsaRoadmaps()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaRoadmap = (id) => {
  return useQuery({
    queryKey: ['dsa', 'roadmaps', id],
    queryFn: async () => {
      const response = await api.getDsaRoadmap(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useUpdateDsaRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDsaRoadmap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'roadmaps'] })
      toast.success('Roadmap updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update roadmap')
    },
  })
}

export const useDeleteDsaRoadmap = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDsaRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'roadmaps'] })
      toast.success('Roadmap deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete roadmap')
    },
  })
}

export const useCompleteDsaRoadmapProblem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, problemId }) => api.completeDsaRoadmapProblem(id, problemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'roadmaps'] })
      toast.success('Problem marked complete')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark problem complete')
    },
  })
}

export const useDsaRoadmapProgress = (id) => {
  return useQuery({
    queryKey: ['dsa', 'roadmaps', id, 'progress'],
    queryFn: async () => {
      const response = await api.getDsaRoadmapProgress(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

// Revisions hooks
export const useCreateDsaRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createDsaRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'revisions'] })
      toast.success('Revision created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create revision')
    },
  })
}

export const useDsaRevisions = (params = {}) => {
  return useQuery({
    queryKey: ['dsa', 'revisions', params],
    queryFn: async () => {
      const response = await api.getDsaRevisions(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaRevision = (id) => {
  return useQuery({
    queryKey: ['dsa', 'revisions', id],
    queryFn: async () => {
      const response = await api.getDsaRevision(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useUpdateDsaRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateDsaRevision(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'revisions'] })
      toast.success('Revision updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update revision')
    },
  })
}

export const useCompleteDsaRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.completeDsaRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'revisions'] })
      toast.success('Revision completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete revision')
    },
  })
}

export const useSkipDsaRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.skipDsaRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'revisions'] })
      toast.success('Revision skipped')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to skip revision')
    },
  })
}

export const useDeleteDsaRevision = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteDsaRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsa', 'revisions'] })
      toast.success('Revision deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete revision')
    },
  })
}

export const useDsaDailyRevisionQueue = () => {
  return useQuery({
    queryKey: ['dsa', 'revisions', 'daily'],
    queryFn: async () => {
      const response = await api.getDsaDailyRevisionQueue()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaWeeklyRevisionQueue = () => {
  return useQuery({
    queryKey: ['dsa', 'revisions', 'weekly'],
    queryFn: async () => {
      const response = await api.getDsaWeeklyRevisionQueue()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useDsaMissedRevisions = () => {
  return useQuery({
    queryKey: ['dsa', 'revisions', 'missed'],
    queryFn: async () => {
      const response = await api.getDsaMissedRevisions()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

// Goals hooks
export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await api.getGoals()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Goal created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create goal')
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Goal updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update goal')
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Goal deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete goal')
    },
  })
}

// Planner hooks
export const usePlannerTasks = (params = {}) => {
  return useQuery({
    queryKey: ['planner', 'tasks', params],
    queryFn: async () => {
      const response = await api.getPlannerTasks(params)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const usePlannerTask = (id) => {
  return useQuery({
    queryKey: ['planner', 'tasks', id],
    queryFn: async () => {
      const response = await api.getPlannerTask(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreatePlannerTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createPlannerTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })
}

export const useUpdatePlannerTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePlannerTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task')
    },
  })
}

export const useDeletePlannerTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deletePlannerTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    },
  })
}

export const useMarkPlannerTaskComplete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markPlannerTaskComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete task')
    },
  })
}

export const useBulkUpdatePlannerTasks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.bulkUpdatePlannerTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Bulk update completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Bulk update failed')
    },
  })
}

export const usePlannerCalendar = (startDate, endDate) => {
  return useQuery({
    queryKey: ['planner', 'calendar', startDate, endDate],
    queryFn: async () => {
      const response = await api.getPlannerCalendar(startDate, endDate)
      return response.data.data
    },
    enabled: !!startDate && !!endDate,
  })
}

export const useCheckPlannerConflict = (date, duration = 60) => {
  return useQuery({
    queryKey: ['planner', 'conflict', date, duration],
    queryFn: async () => {
      const response = await api.checkPlannerConflict(date, duration)
      return response.data.data
    },
    enabled: !!date,
  })
}

export const useDailyPlanner = (date) => {
  return useQuery({
    queryKey: ['planner', 'daily', date],
    queryFn: async () => {
      const response = await api.getDailyPlanner(date)
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useTodayFocus = () => {
  return useQuery({
    queryKey: ['planner', 'today-focus'],
    queryFn: async () => {
      const response = await api.getTodayFocus()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useGenerateSmartTasks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.generateSmartTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'smart-tasks'] })
      toast.success('Smart tasks generated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate smart tasks')
    },
  })
}

export const useSmartTasks = () => {
  return useQuery({
    queryKey: ['planner', 'smart-tasks'],
    queryFn: async () => {
      const response = await api.getSmartTasks()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useSyncAllModules = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.syncAllModules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('All modules synced')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to sync modules')
    },
  })
}

export const usePlannerHabits = () => {
  return useQuery({
    queryKey: ['planner', 'habits'],
    queryFn: async () => {
      const response = await api.getPlannerHabits()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const usePlannerHabit = (id) => {
  return useQuery({
    queryKey: ['planner', 'habits', id],
    queryFn: async () => {
      const response = await api.getPlannerHabit(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreatePlannerHabit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createPlannerHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'habits'] })
      toast.success('Habit created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create habit')
    },
  })
}

export const useUpdatePlannerHabit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePlannerHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'habits'] })
      toast.success('Habit updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update habit')
    },
  })
}

export const useDeletePlannerHabit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deletePlannerHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'habits'] })
      toast.success('Habit deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete habit')
    },
  })
}

export const useCompletePlannerHabit = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, date, value }) => api.completePlannerHabit(id, date, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'habits'] })
      toast.success('Habit completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete habit')
    },
  })
}

// Goals (planner-specific)
export const usePlannerGoals = () => {
  return useQuery({
    queryKey: ['planner', 'goals'],
    queryFn: async () => {
      const response = await api.getPlannerGoals()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const usePlannerGoal = (id) => {
  return useQuery({
    queryKey: ['planner', 'goals', id],
    queryFn: async () => {
      const response = await api.getPlannerGoal(id)
      return response.data.data
    },
    enabled: !!id,
  })
}

export const useCreatePlannerGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createPlannerGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'goals'] })
      toast.success('Goal created')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create goal')
    },
  })
}

export const useUpdatePlannerGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePlannerGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'goals'] })
      toast.success('Goal updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update goal')
    },
  })
}

export const useDeletePlannerGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deletePlannerGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'goals'] })
      toast.success('Goal deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete goal')
    },
  })
}

export const useMarkPlannerGoalComplete = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markPlannerGoalComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner', 'goals'] })
      toast.success('Goal completed')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete goal')
    },
  })
}

// Analytics hooks
export const usePlannerAnalytics = () => {
  return useQuery({
    queryKey: ['planner', 'analytics'],
    queryFn: async () => {
      const response = await api.getPlannerAnalytics()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const usePlannerStats = () => {
  return useQuery({
    queryKey: ['planner', 'stats'],
    queryFn: async () => {
      const response = await api.getPlannerStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Notifications hooks
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.getNotifications()
      return response.data.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('All notifications marked as read')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark notifications as read')
    },
  })
}

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Notification marked as read')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read')
    },
  })
}

// Analytics hooks
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await api.getAnalyticsOverview()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useReadiness = () => {
  return useQuery({
    queryKey: ['analytics', 'readiness'],
    queryFn: async () => {
      const response = await api.getReadiness()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useReadinessBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'readiness-breakdown'],
    queryFn: async () => {
      const response = await api.getReadinessBreakdown()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useApplicationStats = () => {
  return useQuery({
    queryKey: ['analytics', 'applications'],
    queryFn: async () => {
      const response = await api.getApplicationStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useNewApplicationStats = () => {
  return useQuery({
    queryKey: ['analytics', 'applications-new'],
    queryFn: async () => {
      const response = await api.getNewApplicationStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useApplicationTrends = (months = 6) => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'trends', months],
    queryFn: async () => {
      const response = await api.getApplicationTrends(months)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useApplicationFunnel = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'funnel'],
    queryFn: async () => {
      const response = await api.getApplicationFunnel()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useApplicationSources = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'sources'],
    queryFn: async () => {
      const response = await api.getApplicationSources()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useAverageResponseTime = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'response-time'],
    queryFn: async () => {
      const response = await api.getAverageResponseTime()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useStageDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'stages'],
    queryFn: async () => {
      const response = await api.getStageDistribution()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useTopRecruiters = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'recruiters'],
    queryFn: async () => {
      const response = await api.getTopRecruiters()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useOfferConversion = () => {
  return useQuery({
    queryKey: ['analytics', 'applications', 'conversion'],
    queryFn: async () => {
      const response = await api.getOfferConversion()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useCompanyAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'companies'],
    queryFn: async () => {
      const response = await api.getCompanyAnalytics()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useIndustryDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'companies', 'industry'],
    queryFn: async () => {
      const response = await api.getIndustryDistribution()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useLocationDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'companies', 'location'],
    queryFn: async () => {
      const response = await api.getLocationDistribution()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useHiringTrends = (months = 6) => {
  return useQuery({
    queryKey: ['analytics', 'companies', 'hiring-trends', months],
    queryFn: async () => {
      const response = await api.getHiringTrends(months)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useTopCompanies = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'companies', 'top', limit],
    queryFn: async () => {
      const response = await api.getTopCompanies(limit)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useEligibilityAnalysis = () => {
  return useQuery({
    queryKey: ['analytics', 'companies', 'eligibility'],
    queryFn: async () => {
      const response = await api.getEligibilityAnalysis()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInterviewStats = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews'],
    queryFn: async () => {
      const response = await api.getInterviewStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInterviewTrends = (months = 6) => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'trends', months],
    queryFn: async () => {
      const response = await api.getInterviewTrends(months)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInterviewTypeDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'types'],
    queryFn: async () => {
      const response = await api.getInterviewTypeDistribution()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInterviewDifficultyTrends = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'difficulty'],
    queryFn: async () => {
      const response = await api.getInterviewDifficultyTrends()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInterviewAverageRating = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'rating'],
    queryFn: async () => {
      const response = await api.getInterviewAverageRating()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpcomingSchedule = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'schedule'],
    queryFn: async () => {
      const response = await api.getUpcomingSchedule()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useCancelledInterviews = () => {
  return useQuery({
    queryKey: ['analytics', 'interviews', 'cancelled'],
    queryFn: async () => {
      const response = await api.getCancelledInterviews()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'dsa'],
    queryFn: async () => {
      const response = await api.getDsaOverview()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaDifficultyBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'dsa', 'difficulty'],
    queryFn: async () => {
      const response = await api.getDsaDifficultyBreakdown()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useDsaTopicMastery = () => {
  return useQuery({
    queryKey: ['analytics', 'dsa', 'mastery'],
    queryFn: async () => {
      const response = await api.getDsaTopicMastery()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const usePlannerOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'planner'],
    queryFn: async () => {
      const response = await api.getPlannerOverview()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useInsights = () => {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: async () => {
      const response = await api.getInsights()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['analytics', 'recommendations'],
    queryFn: async () => {
      const response = await api.getRecommendations()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useWeeklyReport = () => {
  return useQuery({
    queryKey: ['analytics', 'reports', 'weekly'],
    queryFn: async () => {
      const response = await api.getWeeklyReport()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useMonthlyReport = () => {
  return useQuery({
    queryKey: ['analytics', 'reports', 'monthly'],
    queryFn: async () => {
      const response = await api.getMonthlyReport()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const usePlacementReport = () => {
  return useQuery({
    queryKey: ['analytics', 'reports', 'placement'],
    queryFn: async () => {
      const response = await api.getPlacementReport()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useWeeklyTrend = (weeks = 12) => {
  return useQuery({
    queryKey: ['analytics', 'trend', weeks],
    queryFn: async () => {
      const response = await api.getWeeklyTrend(weeks)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useHeatmap = (days = 84) => {
  return useQuery({
    queryKey: ['analytics', 'heatmap', days],
    queryFn: async () => {
      const response = await api.getHeatmap(days)
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useStreak = () => {
  return useQuery({
    queryKey: ['analytics', 'streak'],
    queryFn: async () => {
      const response = await api.getStreak()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Achievements hooks
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await api.getAchievements()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

// Settings hooks
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.getSettings()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    },
  })
}

export const useChangePassword = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    },
  })
}

export const useSessions = () => {
  return useQuery({
    queryKey: ['settings', 'sessions'],
    queryFn: async () => {
      const response = await api.getSessions()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useRevokeSessions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.revokeSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'sessions'] })
      toast.success('All other sessions revoked')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to revoke sessions')
    },
  })
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAccount,
    onSuccess: () => {
      queryClient.clear()
      localStorage.removeItem('accessToken')
      toast.success('Account deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    },
  })
}

export const useUpdateAppearance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateAppearance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Appearance updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update appearance')
    },
  })
}

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Notification preferences updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update notifications')
    },
  })
}

export const useUpdatePrivacy = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updatePrivacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Privacy settings updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update privacy settings')
    },
  })
}

export const useUpdateSecurity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateSecurity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Security settings updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update security settings')
    },
  })
}

export const useLoginHistory = () => {
  return useQuery({
    queryKey: ['settings', 'security', 'login-history'],
    queryFn: async () => {
      const response = await api.getLoginHistory()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useSecurityLog = () => {
  return useQuery({
    queryKey: ['settings', 'security', 'log'],
    queryFn: async () => {
      const response = await api.getSecurityLog()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpdateProductivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.updateProductivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Productivity settings updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update productivity settings')
    },
  })
}

export const useIntegrations = () => {
  return useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: async () => {
      const response = await api.getIntegrations()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, data }) => api.updateIntegration(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] })
      toast.success('Integration updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update integration')
    },
  })
}

export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.disconnectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] })
      toast.success('Integration disconnected')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to disconnect integration')
    },
  })
}

export const useExportData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.exportData,
    onSuccess: () => {
      toast.success('Data export started. You will be notified when it\'s ready.')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export data')
    },
  })
}

export const useClearCache = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.clearCache,
    onSuccess: () => {
      queryClient.clear()
      toast.success('Cache cleared')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to clear cache')
    },
  })
}

export const useResetPreferences = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.resetPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Preferences reset')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset preferences')
    },
  })
}

export const useDeleteArchivedData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteArchivedData,
    onSuccess: () => {
      toast.success('Archived data deleted')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete archived data')
    },
  })
}

// Waitlist hooks
export const useJoinWaitlist = () => {
  return useMutation({
    mutationFn: api.joinWaitlist,
    onSuccess: (response) => {
      toast.success(response.data.message || 'You\'ve been added to the waitlist')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to join waitlist')
    },
  })
}

export const useWaitlistStats = () => {
  return useQuery({
    queryKey: ['waitlist', 'stats'],
    queryFn: async () => {
      const response = await api.getWaitlistStats()
      return response.data.data
    },
    staleTime: 1000 * 60 * 5,
  })
}