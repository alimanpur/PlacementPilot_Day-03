import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, Eyebrow, StatusPill, EmptyState, Skeleton, KeyStat, PriorityPill } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import {
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useArchiveCompany,
  useToggleFavorite,
  useCompanyStats,
  useFavoriteCompanies,
} from '@/hooks/api'

export default function Companies() {
  const [view, setView] = useState('grid')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    industry: '',
    hiringStatus: '',
    favorite: null,
    priority: '',
    archived: false,
  })

  const { data: companiesData, isLoading, error, refetch } = useCompanies({
    search,
    ...filters,
    page: 1,
    limit: 50,
  })

  const { data: stats } = useCompanyStats()
  const { data: favorites } = useFavoriteCompanies()

  const createMutation = useCreateCompany()
  const deleteMutation = useDeleteCompany()
  const archiveMutation = useArchiveCompany()
  const favoriteMutation = useToggleFavorite()

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    careerPage: '',
    linkedIn: '',
    headquarters: '',
    country: '',
    companySize: '',
    companyType: 'Private',
    hiringStatus: 'Active',
    priority: 'medium',
    tags: '',
    notes: '',
  })

  const companies = companiesData?.companies || []
  const total = companiesData?.total || 0

  const handleCreate = (e) => {
    e.preventDefault()
    if (!formData.name) return

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setFormData({
          name: '',
          industry: '',
          website: '',
          careerPage: '',
          linkedIn: '',
          headquarters: '',
          country: '',
          companySize: '',
          companyType: 'Private',
          hiringStatus: 'Active',
          priority: 'medium',
          tags: '',
          notes: '',
        })
        setShowForm(false)
      },
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleArchive = (id, archived) => {
    archiveMutation.mutate({ id, archived })
  }

  const handleToggleFavorite = (id) => {
    favoriteMutation.mutate(id)
  }

  const industries = useMemo(() => {
    const unique = new Set(companies.map(c => c.industry).filter(Boolean))
    return Array.from(unique)
  }, [companies])

  if (error) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Company Intelligence" title="Companies" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load companies.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Company Intelligence"
          title="Companies"
          meta={`${total} companies in your radar`}
          action={
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
                + Add Company
              </Button>
            </div>
          }
        />

        <PageBody>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <KeyStat label="Total" value={stats.total || 0} />
              </Card>
              <Card>
                <KeyStat label="Active" value={stats.statusCounts?.find(s => s._id === 'Active')?.count || 0} />
              </Card>
              <Card>
                <KeyStat label="Favorites" value={favorites?.length || 0} />
              </Card>
              <Card>
                <KeyStat label="Industries" value={stats.industryCounts?.length || 0} />
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-ink mb-1.5">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">All Industries</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Hiring Status</label>
                <select
                  value={filters.hiringStatus}
                  onChange={(e) => setFilters({ ...filters, hiringStatus: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ industry: '', hiringStatus: '', favorite: null, priority: '', archived: false })}
              >
                Reset Filters
              </Button>
              <div className="flex gap-1 ml-auto">
                <Button
                  variant={view === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={view === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setView('table')}
                >
                  Table
                </Button>
              </div>
            </div>
          </Card>

          {/* Create Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <Eyebrow className="mb-4">Add Company</Eyebrow>
                <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Google"
                      required
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g. Technology"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Career Page</label>
                    <input
                      type="url"
                      value={formData.careerPage}
                      onChange={(e) => setFormData({ ...formData, careerPage: e.target.value })}
                      placeholder="https://example.com/careers"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                      placeholder="https://linkedin.com/company/example"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Headquarters</label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. USA"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Company Size</label>
                    <input
                      type="text"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      placeholder="e.g. 1000-5000"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Company Type</label>
                    <select
                      value={formData.companyType}
                      onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                      <option value="Startup">Startup</option>
                      <option value="MNC">MNC</option>
                      <option value="Government">Government</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Hiring Status</label>
                    <select
                      value={formData.hiringStatus}
                      onChange={(e) => setFormData({ ...formData, hiringStatus: e.target.value })}
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ink mb-1.5">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g. FAANG, Tech, Dream"
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-sm text-ink mb-1.5">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any notes about this company..."
                      rows={3}
                      className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
                    <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
                      Add Company
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {/* Companies List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </Card>
              ))}
            </div>
          ) : companies.length > 0 ? (
            <>
              {view === 'grid' ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {companies.map((company) => (
                    <motion.div key={company._id} variants={staggerItem}>
                      <Link
                        to={`/app/companies/${company._id}`}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-2xl"
                      >
                        <Card className="hover:ring-brand/30 transition h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <PriorityPill priority={company.priority}>
                                  {company.priority}
                                </PriorityPill>
                                {company.favorite && (
                                  <span className="text-yellow-400">★</span>
                                )}
                              </div>
                              <h3 className="font-display text-xl text-ink mb-1">{company.name}</h3>
                              {company.industry && (
                                <p className="text-sm text-ink-3">{company.industry}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <StatusPill tone={company.hiringStatus === 'Active' ? 'brand' : 'neutral'}>
                              {company.hiringStatus}
                            </StatusPill>
                            <span className="text-xs text-ink-4">
                              {new Date(company.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-semibold text-ink-3 uppercase tracking-wider px-4 py-3">Name</th>
                          <th className="text-left text-xs font-semibold text-ink-3 uppercase tracking-wider px-4 py-3">Industry</th>
                          <th className="text-left text-xs font-semibold text-ink-3 uppercase tracking-wider px-4 py-3">Status</th>
                          <th className="text-left text-xs font-semibold text-ink-3 uppercase tracking-wider px-4 py-3">Priority</th>
                          <th className="text-left text-xs font-semibold text-ink-3 uppercase tracking-wider px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map((company) => (
                          <tr key={company._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <Link to={`/app/companies/${company._id}`} className="text-ink hover:text-brand">
                                {company.name}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-ink-3">{company.industry || '-'}</td>
                            <td className="px-4 py-3">
                              <StatusPill tone={company.hiringStatus === 'Active' ? 'brand' : 'neutral'}>
                                {company.hiringStatus}
                              </StatusPill>
                            </td>
                            <td className="px-4 py-3">
                              <PriorityPill priority={company.priority}>{company.priority}</PriorityPill>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFavorite(company._id)}
                                >
                                  {company.favorite ? '★' : '☆'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchive(company._id, !company.archived)}
                                >
                                  {company.archived ? 'Unarchive' : 'Archive'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(company._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No companies found"
              description="Start building your company intelligence hub by adding companies you're targeting."
              action={
                <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                  Add Company
                </Button>
              }
            />
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}