export const validate =
  (schema) =>
  (req, res, next) => {
    try {
      const source =
        req.method === 'GET'
          ? req.query
          : { ...(req.body || {}), ...(req.params || {}) }
      schema.parse((source && typeof source === 'object' ? source : {}) || {})
      next()
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          data: {
            errors: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        })
      }
      next(error)
    }
  }