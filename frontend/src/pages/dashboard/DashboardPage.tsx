{/* Success Message Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-md"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={20} />
                <span>{successMessage}</span>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                className="ml-4 text-white hover:text-green-100"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>