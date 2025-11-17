import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Shield,
  UserPlus,
  // TrendingUp,
  CreditCard,
  Calendar,
  Phone,
  // Mail,
  MapPin,
  CheckCircle,
  // XCircle,
  AlertCircle,
  X,
  User,
  Clock,
  Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { uploadService } from '../../services/uploadService.ts';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { companyService } from '../../services/companyService.ts';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../../components/common/CountdownTimer.tsx';
import html2canvas from 'html2canvas';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.100.32:5000/api';

// Helper function to extract only numbers from a string
// const extractNumbers = (str: string): string => {
//   return str.replace(/\D/g, '');
// };

// Helper function to generate card number from user ID
// const generateCardNumber = (user: any): string => {
//   if (user.idNumber) {
//     const numbers = extractNumbers(user.idNumber);
//     return numbers.slice(-8); // Take last 8 digits
//   }
//   // Fallback to user ID if no ID number
//   const numbers = extractNumbers(user._id);
//   return numbers.slice(-8);
// };


const DashboardPage: React.FC = () => {
  const { user, createUser, getAllUsers, deleteUser, updateUser } = useAuth();
  const { language } = useTheme();
  const navigate = useNavigate();

  // Add custom styles for animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 8s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUserImage, setSelectedUserImage] = useState<{user: any, imageUrl: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{user: any} | null>(null);
  const [paymentModal, setPaymentModal] = useState<{user: any} | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  

  // Define form state type
  type FormState = {
    fullName: string;
    phone: string;
    idNumber: string;
    location: string;
    registrationDate: string;
    amount: string; // USD, equals number of months
    profilePic: File | null;
  };

  // Initial form state
  const initialFormState: FormState = {
    fullName: '',
    phone: '+25261',
    idNumber: '',
    location: '',
    registrationDate: new Date().toISOString().split('T')[0],
    amount: '1',
    profilePic: null
  };

  // Form state reference for uncontrolled inputs
  const formRef = React.useRef<FormState>({ ...initialFormState });
  
  // Local state for controlled components
  const [formState, setFormState] = React.useState<Omit<FormState, 'profilePic'>>(initialFormState);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [users, setUsers] = useState<any[]>([]);
  const [addedUsers, setAddedUsers] = useState<any[]>([]);
  const [companiesCount, setCompaniesCount] = useState<number>(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for search input and debounced search query (Users tab)
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // State for search input in Payments tab
  const [paymentInputValue, setPaymentInputValue] = useState('');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const paymentSearchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search input
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Only set the search query if input is not empty
    if (inputValue.trim() !== '' || searchQuery !== '') {
      searchTimeout.current = setTimeout(() => {
        setSearchQuery(inputValue);
      }, 300);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [inputValue, searchQuery]);

  // Handle input change - direct state update (Users tab)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Debounce payment search input
  useEffect(() => {
    if (paymentSearchTimeout.current) {
      clearTimeout(paymentSearchTimeout.current);
    }

    if (paymentInputValue.trim() !== '' || paymentSearchQuery !== '') {
      paymentSearchTimeout.current = setTimeout(() => {
        setPaymentSearchQuery(paymentInputValue);
      }, 300);
    }

    return () => {
      if (paymentSearchTimeout.current) {
        clearTimeout(paymentSearchTimeout.current);
      }
    };
  }, [paymentInputValue, paymentSearchQuery]);

  // Handle payment search change
  const handlePaymentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInputValue(e.target.value);
  };

  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRoleFilter(value);
  }, []);


  // Helper: format remaining validity time from validUntil
  const getValidityInfo = useCallback((validUntil?: string, registrationDate?: string) => {
    if (!validUntil || !registrationDate) return null;
    
    const end = new Date(validUntil);
    const start = new Date(registrationDate);
    const now = new Date();
    
    const isValid = end.getTime() > now.getTime();
    
    // Calculate exact months between start and end dates
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    // Adjust if the day hasn't been reached yet
    if (end.getDate() < start.getDate()) {
      months--;
    }
    
    // Calculate remaining days after full months
    const tempDate = new Date(start);
    tempDate.setMonth(tempDate.getMonth() + months);
    const remainingDays = Math.floor((end.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));

    const formatSpan = () => {
      if (months >= 1) {
        const m = `${months} ${months === 1 ? (language === 'en' ? 'month' : 'bil') : (language === 'en' ? 'months' : 'bilood')}`;
        // Only show days if there are remaining days and it's less than 30
        const d = remainingDays > 0 && remainingDays < 30 ? ` ${remainingDays} ${remainingDays === 1 ? (language === 'en' ? 'day' : 'maalin') : (language === 'en' ? 'days' : 'maalmo')}` : '';
        return m + d;
      }
      return `${remainingDays} ${remainingDays === 1 ? (language === 'en' ? 'day' : 'maalin') : (language === 'en' ? 'days' : 'maalmo')}`;
    };

    return {
      isValid,
      text: isValid
        ? `${language === 'en' ? 'Remaining' : 'Harsan'}: ${formatSpan()}`
        : `${language === 'en' ? 'Expired' : 'Dhacay'} ${language === 'en' ? '' : ''}${language === 'en' ? `${formatSpan()} ago` : `${formatSpan()} ka hor`}`
    };
  }, [language]);

  // Memoize filtered users with optimized search (Users tab)
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim() && roleFilter === 'all') {
      return addedUsers;
    }
    
    const query = searchQuery.toLowerCase();
    return addedUsers.filter(user => {
      // Only run search if there's a query
      const matchesSearch = !query || 
        user.fullName?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        (user.idNumber && user.idNumber.toLowerCase().includes(query)) ||
        (user.location && user.location.toLowerCase().includes(query));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  }, [addedUsers, searchQuery, roleFilter]);

  // Memoize filtered users for payments tab
  const filteredPaymentUsers = useMemo(() => {
    if (!paymentSearchQuery.trim()) {
      return addedUsers;
    }
    
    const query = paymentSearchQuery.toLowerCase();
    return addedUsers.filter(user => {
      return user.fullName?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        (user.idNumber && user.idNumber.toLowerCase().includes(query)) ||
        (user.location && user.location.toLowerCase().includes(query));
    });
  }, [addedUsers, paymentSearchQuery]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers({ page: 1, limit: 100 });
      // setUsers(response.users);
      setAddedUsers(response.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAllUsers]);

  // Load companies count
  const loadCompaniesCount = useCallback(async () => {
    try {
      const response = await companyService.getAllCompanies({ limit: 1000 });
      if (response && response.companies) {
        setCompaniesCount(response.companies.length);
      }
    } catch (error) {
      console.error('Error loading companies count:', error);
      setCompaniesCount(0);
    }
  }, []);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load companies count on component mount
  useEffect(() => {
    loadCompaniesCount();
  }, [loadCompaniesCount]);

  // Handle input changes for controlled components
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      let phoneValue = value;
      
      // If user types without +252, prepend it
      if (value && !value.startsWith('+252')) {
        // If it starts with 61, add +252 prefix
        if (value.startsWith('61')) {
          phoneValue = '+252' + value;
        } else if (value.startsWith('252')) {
          // If it starts with 252, add + prefix
          phoneValue = '+' + value;
        } else {
          // For any other case, prepend +25261
          phoneValue = '+25261' + value;
        }
      }
      
      setFormState(prev => ({
        ...prev,
        [name]: phoneValue
      }));
      formRef.current = {
        ...formRef.current,
        [name]: phoneValue
      };
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
      formRef.current = {
        ...formRef.current,
        [name]: value
      };
    }
  };

  // Handle select changes
  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormState(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  //   formRef.current = {
  //     ...formRef.current,
  //     [name]: value
  //   };
  // };

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formRef.current.profilePic = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ID image functionality removed

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload profile picture first (if provided)
      let profilePicUrl: string | undefined = undefined;
      if (formRef.current.profilePic) {
        const validation = uploadService.validateFile(formRef.current.profilePic);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid image file');
        }
        const uploadResp = await uploadService.uploadFile(formRef.current.profilePic);
        if (!uploadResp?.success || !uploadResp?.data?.url) {
          throw new Error('Failed to upload profile picture');
        }
        profilePicUrl = uploadResp.data.url;
      }

      // Calculate validity end date from registrationDate + amount months
      const months = Math.max(1, parseInt(formState.amount || '1', 10));
      const startDate = new Date(formState.registrationDate);
      const validUntilDate = new Date(startDate);
      
      // More accurate month calculation to avoid date overflow issues
      const currentYear = validUntilDate.getFullYear();
      const currentMonth = validUntilDate.getMonth();
      const currentDay = validUntilDate.getDate();
      
      // Calculate target year and month
      const totalMonths = currentMonth + months;
      const targetYear = currentYear + Math.floor(totalMonths / 12);
      const targetMonth = totalMonths % 12;
      
      // Set the new date, ensuring we don't exceed the days in the target month
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const finalDay = Math.min(currentDay, daysInTargetMonth);
      
      validUntilDate.setFullYear(targetYear, targetMonth, finalDay);

      const userData = {
        fullName: formState.fullName,
        phone: formState.phone,
        role: 'customer' as const, // Default role since it's no longer in the form
        idNumber: formState.idNumber,
        registrationDate: formState.registrationDate,
        amount: months,
        validUntil: validUntilDate.toISOString(),
        profilePicUrl
      };

      const newUser = await createUser(userData);
      
      // Add to local state
      setAddedUsers(prev => [newUser, ...prev]);
      
      // Reset form
      setFormState(initialFormState);
      formRef.current = { ...initialFormState };
      setPreviewImage(null);
      setShowAddUserForm(false);
      
    } catch (error) {
      console.error('Error creating user:', error);
      // Show error message to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormState(initialFormState);
    formRef.current = { ...initialFormState };
    setPreviewImage(null);
    setShowAddUserForm(false);
  };

  // Handle user actions - Memoized to prevent recreation
  const handleImageClick = useCallback(async (user: any) => {
    const refreshUrl = async (fileUrl: string) => {
      if (!fileUrl || fileUrl.trim() === '') return null;
      try {
        const response = await fetch('/api/upload/refresh-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ fileUrl })
        });
        if (response.ok) {
          const data = await response.json();
          return data.data.url;
        }
        return fileUrl; // Fallback to original URL if refresh fails
      } catch (err) {
        console.warn('Failed to refresh image URL:', err);
        return fileUrl; // Fallback on error
      }
    };

    const profileUrl = user.profilePicUrl;

    if (!profileUrl) {
      console.warn('No profile picture available for user:', user.fullName);
      alert('No profile picture available.');
      return;
    }

    // Refresh profile picture URL
    const refreshedProfileUrl = await refreshUrl(profileUrl);

    setSelectedUserImage({
      user,
      imageUrl: refreshedProfileUrl || profileUrl
    });
  }, []);

  const handleDeleteClick = useCallback((user: any) => {
    setDeleteConfirmation({ user });
  }, []);

  // Download ID card as image
  const handleDownloadCard = useCallback(async (user: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Log to verify correct user is being passed
    console.log('handleDownloadCard called with user:', user.fullName, user._id, user.idNumber);
    
    try {
      // Create a hidden card element specifically for download (without buttons)
      const downloadCard = document.createElement('div');
      downloadCard.style.position = 'fixed';
      downloadCard.style.left = '-9999px';
      downloadCard.style.top = '0';
      downloadCard.style.width = '400px';
      downloadCard.style.backgroundColor = 'white';
      downloadCard.style.borderRadius = '24px';
      downloadCard.style.overflow = 'hidden';
      downloadCard.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      
      const isValid = user.validUntil && new Date() <= new Date(user.validUntil);
      const isExpired = user.validUntil && new Date() > new Date(user.validUntil);
      
      // Load profile image and convert to data URL using backend proxy (bypasses CORS)
      let profileImageDataUrl = '';
      
      if (user.profilePicUrl && user.profilePicUrl.trim() !== '') {
        try {
          // Use backend proxy to get image as data URL (bypasses CORS completely)
          const proxyResponse = await fetch('/api/upload/proxy-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ fileUrl: user.profilePicUrl })
          });
          
          if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            profileImageDataUrl = proxyData.data.dataUrl;
          } else {
            // Fallback: try to load fallback image
            profileImageDataUrl = await new Promise<string>((resolve) => {
              const fallback = new Image();
              fallback.crossOrigin = 'anonymous';
              fallback.onload = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = fallback.naturalWidth || 200;
                  canvas.height = fallback.naturalHeight || 200;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(fallback, 0, 0);
                    resolve(canvas.toDataURL('image/png', 0.95));
                  } else {
                    resolve('/icons/founder.jpeg');
                  }
                } catch (e) {
                  resolve('/icons/founder.jpeg');
                }
              };
              fallback.onerror = () => resolve('/icons/founder.jpeg');
              fallback.src = '/icons/founder.jpeg';
            });
          }
        } catch (e) {
          console.error('Error loading profile image via proxy:', e);
          // Final fallback
          profileImageDataUrl = '/icons/founder.jpeg';
        }
      }
      
      // Create the card structure
      const cardWrapper = document.createElement('div');
      cardWrapper.style.width = '400px';
      cardWrapper.style.background = 'white';
      cardWrapper.style.borderRadius = '24px';
      cardWrapper.style.overflow = 'hidden';
      cardWrapper.style.position = 'relative';
      
      // Header
      const header = document.createElement('div');
      header.style.height = '120px';
      header.style.background = isExpired 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)' 
        : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #9333ea 100%)';
      header.style.position = 'relative';
      header.style.overflow = 'hidden';
      
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.background = isExpired 
        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)' 
        : 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)';
      header.appendChild(overlay);
      
      // Badge
      const badge = document.createElement('div');
      badge.style.position = 'absolute';
      badge.style.top = '16px';
      badge.style[isExpired ? 'left' : 'right'] = '16px';
      if (isExpired) badge.style.transform = 'translateX(-50%)';
      badge.style.zIndex = '20';
      const badgeInner = document.createElement('div');
      badgeInner.style.background = isExpired ? '#dc2626' : '#16a34a';
      badgeInner.style.color = 'white';
      badgeInner.style.padding = '8px 16px';
      badgeInner.style.borderRadius = '9999px';
      badgeInner.style.fontWeight = 'bold';
      badgeInner.style.fontSize = '12px';
      badgeInner.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      badgeInner.textContent = isExpired ? 'INVALID' : 'VALID';
      badge.appendChild(badgeInner);
      header.appendChild(badge);
      
      cardWrapper.appendChild(header);
      
      // Avatar section
      const avatarSection = document.createElement('div');
      avatarSection.style.position = 'relative';
      avatarSection.style.marginTop = '-64px';
      avatarSection.style.padding = '0 24px 24px 24px';
      
      const avatarContainer = document.createElement('div');
      avatarContainer.style.display = 'flex';
      avatarContainer.style.justifyContent = 'center';
      avatarContainer.style.width = '100%';
      
      const avatarWrapper = document.createElement('div');
      avatarWrapper.style.position = 'relative';
      
      // Create image element properly - use data URL to avoid CORS issues
      if (profileImageDataUrl) {
        const img = document.createElement('img');
        img.src = profileImageDataUrl;
        img.alt = user.fullName || 'User';
        img.style.width = '112px';
        img.style.height = '112px';
        img.style.borderRadius = '9999px';
        img.style.objectFit = 'cover';
        img.style.border = '4px solid white';
        img.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        // No need for crossOrigin when using data URL
        img.onerror = () => {
          // If data URL fails, try to load fallback
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = fallbackImg.naturalWidth;
            canvas.height = fallbackImg.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(fallbackImg, 0, 0);
              img.src = canvas.toDataURL('image/png');
            }
          };
          fallbackImg.src = '/icons/founder.jpeg';
        };
        avatarWrapper.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.style.width = '112px';
        placeholder.style.height = '112px';
        placeholder.style.borderRadius = '9999px';
        placeholder.style.background = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
        placeholder.style.border = '4px solid white';
        placeholder.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.innerHTML = '<svg style="width: 48px; height: 48px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
        avatarWrapper.appendChild(placeholder);
      }
      
      // Status indicator
      const statusIndicator = document.createElement('div');
      statusIndicator.style.position = 'absolute';
      statusIndicator.style.bottom = '-4px';
      statusIndicator.style.right = '-4px';
      statusIndicator.style.width = '32px';
      statusIndicator.style.height = '32px';
      statusIndicator.style.borderRadius = '9999px';
      statusIndicator.style.border = '4px solid white';
      statusIndicator.style.background = isExpired ? '#ef4444' : '#22c55e';
      statusIndicator.style.display = 'flex';
      statusIndicator.style.alignItems = 'center';
      statusIndicator.style.justifyContent = 'center';
      const statusDot = document.createElement('div');
      statusDot.style.width = '12px';
      statusDot.style.height = '12px';
      statusDot.style.background = 'white';
      statusDot.style.borderRadius = '9999px';
      statusIndicator.appendChild(statusDot);
      avatarWrapper.appendChild(statusIndicator);
      
      avatarContainer.appendChild(avatarWrapper);
      avatarSection.appendChild(avatarContainer);
      
      // User Information section
      const infoSection = document.createElement('div');
      infoSection.style.marginTop = '16px';
      
      // Name
      const nameContainer = document.createElement('div');
      nameContainer.style.textAlign = 'center';
      nameContainer.style.marginBottom = '16px';
      const nameWrapper = document.createElement('div');
      nameWrapper.style.display = 'flex';
      nameWrapper.style.alignItems = 'center';
      nameWrapper.style.justifyContent = 'center';
      nameWrapper.style.gap = '8px';
      const nameHeading = document.createElement('h3');
      nameHeading.style.fontSize = '18px';
      nameHeading.style.fontWeight = 'bold';
      nameHeading.style.color = '#111827';
      nameHeading.style.margin = '0';
      nameHeading.textContent = user.fullName || 'N/A';
      nameWrapper.appendChild(nameHeading);
      if (isValid) {
        // Convert check icon to data URL to avoid CORS issues
        const checkIconDataUrl = await new Promise<string>((resolve) => {
          const checkImg = new Image();
          checkImg.crossOrigin = 'anonymous';
          checkImg.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = checkImg.naturalWidth;
              canvas.height = checkImg.naturalHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(checkImg, 0, 0);
                resolve(canvas.toDataURL('image/png'));
              } else {
                resolve('/icons/check.png');
              }
            } catch (e) {
              resolve('/icons/check.png');
            }
          };
          checkImg.onerror = () => resolve('/icons/check.png');
          checkImg.src = '/icons/check.png';
          setTimeout(() => resolve('/icons/check.png'), 3000);
        });
        
        const checkImg = document.createElement('img');
        checkImg.src = checkIconDataUrl;
        checkImg.alt = 'Valid';
        checkImg.style.width = '20px';
        checkImg.style.height = '20px';
        nameWrapper.appendChild(checkImg);
      }
      nameContainer.appendChild(nameWrapper);
      infoSection.appendChild(nameContainer);
      
      // Information Grid
      const infoGrid = document.createElement('div');
      infoGrid.style.display = 'flex';
      infoGrid.style.flexDirection = 'column';
      infoGrid.style.gap = '8px';
      
      // Phone Number
      const phoneRow = document.createElement('div');
      phoneRow.style.display = 'flex';
      phoneRow.style.alignItems = 'center';
      phoneRow.style.justifyContent = 'space-between';
      phoneRow.style.background = '#f9fafb';
      phoneRow.style.borderRadius = '8px';
      phoneRow.style.padding = '8px 12px';
      const phoneLabel = document.createElement('span');
      phoneLabel.style.color = '#4b5563';
      phoneLabel.style.fontWeight = '500';
      phoneLabel.style.fontSize = '14px';
      phoneLabel.style.display = 'flex';
      phoneLabel.style.alignItems = 'center';
      phoneLabel.style.gap = '8px';
      phoneLabel.innerHTML = `<svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>${language === 'en' ? 'Number' : 'Lambar'}`;
      const phoneValue = document.createElement('span');
      phoneValue.style.color = '#111827';
      phoneValue.style.fontWeight = '600';
      phoneValue.style.fontSize = '14px';
      phoneValue.textContent = user.phone || 'N/A';
      phoneRow.appendChild(phoneLabel);
      phoneRow.appendChild(phoneValue);
      infoGrid.appendChild(phoneRow);
      
      // ID Number
      if (user.idNumber) {
        const idRow = document.createElement('div');
        idRow.style.display = 'flex';
        idRow.style.alignItems = 'center';
        idRow.style.justifyContent = 'space-between';
        idRow.style.background = '#f9fafb';
        idRow.style.borderRadius = '8px';
        idRow.style.padding = '8px 12px';
        const idLabel = document.createElement('span');
        idLabel.style.color = '#4b5563';
        idLabel.style.fontWeight = '500';
        idLabel.style.fontSize = '14px';
        idLabel.style.display = 'flex';
        idLabel.style.alignItems = 'center';
        idLabel.style.gap = '8px';
        idLabel.innerHTML = `<svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>${language === 'en' ? 'ID' : 'Aqoonsi'}`;
        const idValue = document.createElement('span');
        idValue.style.color = '#111827';
        idValue.style.fontWeight = '600';
        idValue.style.fontSize = '14px';
        idValue.textContent = user.idNumber;
        idRow.appendChild(idLabel);
        idRow.appendChild(idValue);
        infoGrid.appendChild(idRow);
      }
      
      // Registration Date
      if (user.createdAt) {
        const dateRow = document.createElement('div');
        dateRow.style.display = 'flex';
        dateRow.style.alignItems = 'flex-start';
        dateRow.style.justifyContent = 'space-between';
        dateRow.style.background = isExpired ? '#fef2f2' : '#eff6ff';
        dateRow.style.borderRadius = '8px';
        dateRow.style.padding = '8px 12px';
        const dateLabel = document.createElement('span');
        dateLabel.style.color = isExpired ? '#dc2626' : '#2563eb';
        dateLabel.style.fontWeight = '500';
        dateLabel.style.fontSize = '12px';
        dateLabel.style.display = 'flex';
        dateLabel.style.alignItems = 'center';
        dateLabel.style.gap = '8px';
        dateLabel.innerHTML = `<svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${language === 'en' ? 'Registered' : 'Diiwaangashan'}`;
        const dateValue = document.createElement('span');
        dateValue.style.color = isExpired ? '#991b1b' : '#1e40af';
        dateValue.style.fontWeight = 'bold';
        dateValue.style.fontSize = '12px';
        dateValue.style.textAlign = 'right';
        dateValue.textContent = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        dateRow.appendChild(dateLabel);
        dateRow.appendChild(dateValue);
        infoGrid.appendChild(dateRow);
      }
      
      // Expiration Date
      if (user.validUntil) {
        const expiryRow = document.createElement('div');
        expiryRow.style.display = 'flex';
        expiryRow.style.alignItems = 'flex-start';
        expiryRow.style.justifyContent = 'space-between';
        expiryRow.style.background = isExpired ? '#fef2f2' : '#f0fdf4';
        expiryRow.style.borderRadius = '8px';
        expiryRow.style.padding = '8px 12px';
        const expiryLabel = document.createElement('span');
        expiryLabel.style.color = isExpired ? '#dc2626' : '#16a34a';
        expiryLabel.style.fontWeight = '500';
        expiryLabel.style.fontSize = '12px';
        expiryLabel.style.display = 'flex';
        expiryLabel.style.alignItems = 'center';
        expiryLabel.style.gap = '8px';
        expiryLabel.innerHTML = `<svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${language === 'en' ? 'Expires' : 'Dhamaan'}`;
        const expiryValue = document.createElement('span');
        expiryValue.style.color = isExpired ? '#991b1b' : '#14532d';
        expiryValue.style.fontWeight = 'bold';
        expiryValue.style.fontSize = '12px';
        expiryValue.style.textAlign = 'right';
        expiryValue.textContent = new Date(user.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        expiryRow.appendChild(expiryLabel);
        expiryRow.appendChild(expiryValue);
        infoGrid.appendChild(expiryRow);
      }
      
      infoSection.appendChild(infoGrid);
      avatarSection.appendChild(infoSection);
      cardWrapper.appendChild(avatarSection);
      downloadCard.appendChild(cardWrapper);
      
      document.body.appendChild(downloadCard);
      
      // Wait for images to load (data URLs load instantly, but wait for rendering)
      if (profileImageDataUrl) {
        const img = downloadCard.querySelector('img');
        if (img) {
          await new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
              setTimeout(() => resolve(null), 2000);
            }
          });
        }
      }
      
      // Additional wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Configure html2canvas options for better quality and image handling
      const canvas = await html2canvas(downloadCard, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: false, // Not needed since we're using data URLs
        allowTaint: false,
        foreignObjectRendering: false, // Disable for better compatibility
        imageTimeout: 5000,
        removeContainer: true,
        width: 400,
        height: downloadCard.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure all images in cloned document are loaded
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img: HTMLImageElement) => {
            if (img.src && img.src.startsWith('data:')) {
              // Data URLs are already loaded
              return;
            }
          });
        }
      });

      // Remove the temporary element
      document.body.removeChild(downloadCard);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          alert(language === 'en' ? 'Failed to create image. Please try again.' : 'Waxaa dhacay khalad markii la abuurnayay sawirka. Fadlan mar kale isku day.');
          return;
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${(user.fullName || 'User').replace(/[^a-z0-9]/gi, '_')}_Sahal_Card_${user.idNumber || user._id}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error downloading card:', error);
      alert(language === 'en' ? 'Failed to download card. Please try again.' : 'Waxaa dhacay khalad markii la soo dejinayay kaarka. Fadlan mar kale isku day.');
    }
  }, [language]);

  // Handle payment click
  const handlePaymentClick = useCallback((user: any) => {
    setPaymentModal({ user });
    setPaymentAmount('1');
  }, []);



  // Calculate months owed for expired users
  const calculateMonthsOwed = (validUntil: string) => {
    const now = new Date();
    const expiredDate = new Date(validUntil);
    
    if (expiredDate >= now) return 0;
    
    const yearsDiff = now.getFullYear() - expiredDate.getFullYear();
    const monthsDiff = now.getMonth() - expiredDate.getMonth();
    const totalMonthsExpired = (yearsDiff * 12) + monthsDiff;
    
    return Math.max(0, totalMonthsExpired);
  };

  // Calculate remaining months and balance (1 month = $1)
  const calculateRemainingBalance = (validUntil: string | undefined, createdAt: string | undefined) => {
    if (!validUntil || !createdAt) return { months: 0, balance: 0, isValid: false };
    
    const now = new Date();
    const expiryDate = new Date(validUntil);
    // const registrationDate = new Date(createdAt);
    
    // If expired, balance is negative (debt)
    if (expiryDate < now) {
      const monthsExpired = calculateMonthsOwed(validUntil);
      return { 
        months: -monthsExpired, 
        balance: -monthsExpired, 
        isValid: false 
      };
    }
    
    // Calculate remaining months from now until expiry
    const yearsDiff = expiryDate.getFullYear() - now.getFullYear();
    const monthsDiff = expiryDate.getMonth() - now.getMonth();
    const daysDiff = expiryDate.getDate() - now.getDate();
    
    let remainingMonths = (yearsDiff * 12) + monthsDiff;
    
    // If days are negative, subtract one month
    if (daysDiff < 0) {
      remainingMonths--;
    }
    
    // Ensure at least 0 months
    remainingMonths = Math.max(0, remainingMonths);
    
    return { 
      months: remainingMonths, 
      balance: remainingMonths, // $1 per month
      isValid: true 
    };
  };

  // Process payment
  const processPayment = async () => {
    if (!paymentModal || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount' : 'Fadlan geli qaddar sax ah');
      return;
    }

    try {
      setIsLoading(true);
      const user = paymentModal.user;
      
      // Calculate new validity date
      let startDate: Date;
      let monthsToAdd = Math.floor(amount); // Each $1 = 1 month
      
      if (user.validUntil && new Date(user.validUntil) > new Date()) {
        // User is VALID - extend from current validUntil
        startDate = new Date(user.validUntil);
      } else {
        // User is INVALID or no validity date
        if (user.validUntil) {
          // Calculate months owed
          const monthsOwed = calculateMonthsOwed(user.validUntil);
          
          if (monthsToAdd < monthsOwed) {
            alert(
              language === 'en' 
                ? `User owes $${monthsOwed} for ${monthsOwed} expired months. Please pay at least $${monthsOwed}.`
                : `Isticmaalaha wuxuu leeyahay $${monthsOwed} ${monthsOwed} bilood oo dhacay. Fadlan bixi ugu yaraan $${monthsOwed}.`
            );
            setIsLoading(false);
            return;
          }
          
          // Subtract months owed from payment
          monthsToAdd -= monthsOwed;
        }
        
        // Start from today
        startDate = new Date();
      }
      
      // Calculate new validity date
      const newValidUntil = new Date(startDate);
      const currentYear = newValidUntil.getFullYear();
      const currentMonth = newValidUntil.getMonth();
      const currentDay = newValidUntil.getDate();
      
      const totalMonths = currentMonth + monthsToAdd;
      const targetYear = currentYear + Math.floor(totalMonths / 12);
      const targetMonth = totalMonths % 12;
      const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
      const finalDay = Math.min(currentDay, daysInTargetMonth);
      
      newValidUntil.setFullYear(targetYear, targetMonth, finalDay);
      
      // Update user via API
      await updateUser(user._id, {
        validUntil: newValidUntil.toISOString()
      });
      
      // Update local state
      setAddedUsers(prev => prev.map(u => 
        u._id === user._id 
          ? { ...u, validUntil: newValidUntil.toISOString() }
          : u
      ));
      
      alert(
        language === 'en'
          ? `Payment successful! User is now valid until ${newValidUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
          : `Lacag bixintii waa guuleysatay! Isticmaalaha hadda waa ansax ilaa ${newValidUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
      );
      
      setPaymentModal(null);
      setPaymentAmount('');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert(language === 'en' ? 'Failed to process payment' : 'Lacag bixinta way fashilantay');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        await deleteUser(deleteConfirmation.user._id);
        setAddedUsers(prev => prev.filter(u => u._id !== deleteConfirmation.user._id));
        setDeleteConfirmation(null);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Overview Tab Component - Memoized to prevent recreation
  const OverviewTab = useMemo(() => (
  <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Total Users' : 'Wadarta Isticmaalayaasha'}
              </p>
              <p className="text-3xl font-bold text-gray-900">{addedUsers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
              </motion.div>

                  
                    <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Companies' : 'Shirkadaha'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {companiesCount}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/companies')}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors group"
                title={language === 'en' ? 'Add New Company' : 'Ku Dar Shirkad Cusub'}
              >
                <Plus className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              </button>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

              <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {language === 'en' ? 'Admins' : 'Maamulayaasha'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {addedUsers.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
                  </div>
                  
      {/* Recent Users */}
                    <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {language === 'en' ? 'Recent Users' : 'Isticmaalayaasha Dhowaan'}
          </h3>
                        <button
            onClick={() => setActiveTab('users')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {language === 'en' ? 'View All' : 'Fiiri Dhammaan'}
                        </button>
                      </div>

        <div className="space-y-4">
          {addedUsers.slice(0, 5).map((user, index) => (
                  <motion.div 
              key={user._id}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {user.profilePicUrl && user.profilePicUrl.trim() !== '' ? (
                <div className="relative">
                  <img
                    src={user.profilePicUrl}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-lg"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    user.validUntil && new Date() > new Date(user.validUntil)
                      ? 'bg-red-500' // Red status for expired
                      : 'bg-green-500' // Green status for valid
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              </motion.div>
          ))}
        </div>
              </motion.div>
          </motion.div>
  ), [addedUsers, language, companiesCount, navigate]);

  // Users Tab Component - Memoized to prevent recreation
  const UsersTab = useMemo(() => {
    // Check if logged-in user is admin or superadmin
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    
    return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Users Table */}
      <motion.div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <motion.div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 border-b border-gray-200">
          <motion.div className="flex items-center justify-between">
            <motion.div className="flex items-center space-x-3">
              <motion.div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {language === 'en' ? 'Users Management' : 'Maamulka Isticmaalayaasha'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {language === 'en' ? 'Manage all users in the system' : 'Maamul dhammaan isticmaalayaasha nidaamka'}
                </p>
        </motion.div>
            </motion.div>

            <motion.button
              onClick={() => setShowAddUserForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="w-5 h-5" />
              <span>{language === 'en' ? 'Add User' : 'Ku Dar Isticmaale'}</span>
            </motion.button>
          </motion.div>
            </motion.div>



        {/* ISOLATED Search Section - Completely separate from main component */}
        <div id="search-container" className="p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                id="search-input"
                type="text"
                placeholder="Search users..."
                value={inputValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                autoComplete="off"
                onFocus={(e) => e.target.select()}
                onKeyPress={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            </div>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={handleRoleChange}
              className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <motion.div className="p-6">
          {isLoading ? (
          <motion.div 
              className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
          >
            <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Users className="w-8 h-8 text-white" />
          </motion.div>
              <p className="text-gray-600 font-medium">
                {language === 'en' ? 'Loading users...' : 'Waa la soo gelayaa isticmaalayaasha...'}
              </p>
            </motion.div>
          ) : addedUsers.length === 0 ? (
          <motion.div 
            className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
              <motion.div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'No Users Found' : 'Ma Jiraan Isticmaalayaal'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {language === 'en' 
                  ? 'No users have been added yet. Click "Add User" to get started.'
                  : 'Weli ma la dhinin isticmaalayaal. Guji "Ku Dar Isticmaale" si aad u bilowdo.'
                }
              </p>
            </motion.div>
        ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user._id}
                data-user-card
                data-user-unique-id={user._id}
                data-user-name={user.fullName}
                data-user-phone={user.phone}
                data-user-id={user.idNumber}
                data-user-location={user.location}
                data-user-role={user.role}
                  className={`group relative rounded-3xl shadow-lg hover:shadow-2xl border overflow-hidden transition-all duration-500 ${
                    user.validUntil && new Date() > new Date(user.validUntil)
                      ? 'bg-red-50 border-red-200 hover:border-red-300' // Red card for expired users
                      : 'bg-white border-gray-100 hover:border-blue-200' // Normal white card
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                >
                  {/* Corner validity badge with animation */}
                  {user.validUntil && (() => {
                    const info = getValidityInfo(user.validUntil, user.createdAt);
                    if (!info) return null;
                    const badgeClass = info.isValid 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg';
                    return (
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${badgeClass} z-10`}>
                        {info.isValid ? (
                          <div className="flex items-center gap-1">
                            {/* Animated Checkmark - Simple and Stable */}
                            <motion.svg
                              className="w-3 h-3 flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.path
                                d="M20 6L9 17l-5-5"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ 
                                  duration: 0.6,
                                  delay: 0.1,
                                  ease: "easeOut"
                                }}
                              />
                            </motion.svg>
                            {/* Typewriter Animation for VALID */}
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: "auto" }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {language === 'en' ? 'Valid' : 'Ansax'}
                            </motion.span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              ✗
                            </motion.span>
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: "auto" }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {language === 'en' ? 'Expired' : 'Dhacay'}
                            </motion.span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Enhanced header with gradient - red for expired, normal for valid */}
                  <div className={`relative h-28 w-full overflow-hidden ${
                    user.validUntil && new Date() > new Date(user.validUntil)
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' // Red gradient for expired
                      : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' // Normal gradient
                  }`}>
                    <div className={`absolute inset-0 ${
                      user.validUntil && new Date() > new Date(user.validUntil)
                        ? 'bg-gradient-to-r from-red-400/20 to-red-500/20' // Red overlay for expired
                        : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20' // Normal overlay
                    }`} />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                  </div>

                  {/* INVALID badge for expired users */}
                  {user.validUntil && new Date() > new Date(user.validUntil) && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        INVALID
                      </div>
                    </div>
                  )}

                  {/* Avatar with enhanced styling */}
                  <div className="relative -mt-16 px-6 pb-6">
                    <div className="w-full flex items-center justify-center">
                      {user.profilePicUrl && user.profilePicUrl.trim() !== '' ? (
                        <div className="relative cursor-pointer group/avatar" onClick={() => handleImageClick(user)}>
                          <img
                            src={user.profilePicUrl}
                            alt={user.fullName}
                            className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-2xl transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:shadow-3xl"
                            onError={(e) => {
                              console.log('Profile picture failed to load:', user.profilePicUrl);
                              e.currentTarget.src = '/icons/founder.jpeg';
                            }}
                          />
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                            user.validUntil && new Date() > new Date(user.validUntil)
                              ? 'bg-red-500' // Red status for expired
                              : 'bg-green-500' // Green status for valid
                          }`}>
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white shadow-2xl flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                            user.validUntil && new Date() > new Date(user.validUntil)
                              ? 'bg-red-500' // Red status for expired
                              : 'bg-green-500' // Green status for valid
                          }`}>
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Information - Clean Structure */}
                    <div className="mt-4 space-y-3">
                      {/* Name */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 truncate" data-user-name>
                      {user.fullName}
                        </h3>
                          {user.validUntil && new Date() <= new Date(user.validUntil) && (
                            <img 
                              src="/icons/check.png" 
                              alt="Valid" 
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                      </div>

                      {/* Information Grid */}
                      <div className="space-y-2 text-sm">
                        {/* Phone Number */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-600 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {language === 'en' ? 'Number' : 'Lambar'}
                      </span>
                          <span className="text-gray-900 font-semibold" data-user-phone>{user.phone}</span>
                        </div>

                        {/* ID Number */}
                        {user.idNumber && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-600 font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {language === 'en' ? 'ID' : 'Aqoonsi'}
                            </span>
                            <span className="text-gray-900 font-semibold" data-user-id>{user.idNumber}</span>
                          </div>
                        )}

                        {/* Registration Date */}
                        {user.createdAt && (
                          <div className="flex items-start justify-between bg-blue-50 rounded-lg px-3 py-2">
                            <span className="text-blue-600 font-medium flex items-center gap-2 flex-shrink-0 text-xs">
                              <Calendar className="w-3 h-3" />
                              {language === 'en' ? 'Registered' : 'Diiwaangashan'}
                            </span>
                            <span className="text-blue-900 font-bold text-right text-sm leading-tight">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Compact action buttons */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                              onClick={() => handleImageClick(user)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{language === 'en' ? 'View' : 'Fiiri'}</span>
                      </button>
                      {/* Download button - only for admin/superadmin */}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Explicitly capture the current user from the map iteration
                            const currentUser = user;
                            console.log('Download button clicked for user:', currentUser.fullName, currentUser._id, currentUser.idNumber);
                            handleDownloadCard(currentUser, e);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs font-medium"
                        >
                          <Download className="w-3 h-3" />
                          <span>{language === 'en' ? 'Download' : 'Soo Deji'}</span>
                        </button>
                      )}
                      <button
                      onClick={() => handleDeleteClick(user)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{language === 'en' ? 'Delete' : 'Tirtir'}</span>
                      </button>
                    </div>
                  </div>
                  </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      </motion.div>
    </motion.div>
    );
  }, [filteredUsers, isLoading, language, addedUsers, getValidityInfo, handleDeleteClick, handleImageClick, handleDownloadCard, handleRoleChange, inputValue, roleFilter, user]);

  // Payments Tab Component - Memoized to prevent recreation
  const PaymentsTab = useMemo(() => (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <motion.div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 border-b border-gray-200">
          <motion.div className="flex items-center justify-between">
            <motion.div className="flex items-center space-x-3">
              <motion.div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div>
                <h2 className="text-2xl font-bold text-gray-800">
              {language === 'en' ? 'Payments Management' : 'Maamulka Lacagaha'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {language === 'en' ? 'Search and view user payment information' : 'Baadh oo fiiri macluumaadka lacag bixinta isticmaalayaasha'}
        </p>
                      </motion.div>
                </motion.div>
          </motion.div>
        </motion.div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search users by name, phone, ID...' : 'Raadi isticmaalayaasha magaca, taleefanka, aqoonsiga...'}
              value={paymentInputValue}
              onChange={handlePaymentSearchChange}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Users Payment List */}
        <motion.div className="p-6">
          {isLoading ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <DollarSign className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-gray-600 font-medium">
                {language === 'en' ? 'Loading payment data...' : 'Waa la soo gelayaa xogta lacag bixinta...'}
              </p>
            </motion.div>
          ) : filteredPaymentUsers.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-12 h-12 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {language === 'en' ? 'No Users Found' : 'Ma Jiraan Isticmaalayaal'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {language === 'en' 
                  ? 'No users match your search criteria.'
                  : 'Ma jiraan isticmaalayaal ku habboon shuruudahaaga raadinta.'}
              </p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPaymentUsers.map((user, index) => (
              <motion.div
                key={user._id}
                data-user-card
                data-user-unique-id={user._id}
                data-user-name={user.fullName}
                data-user-phone={user.phone}
                data-user-id={user.idNumber}
                data-user-location={user.location}
                data-user-role={user.role}
                  className={`group relative rounded-3xl shadow-lg hover:shadow-2xl border overflow-hidden transition-all duration-500 ${
                    user.validUntil && new Date() > new Date(user.validUntil)
                      ? 'bg-red-50 border-red-200 hover:border-red-300'
                      : 'bg-white border-gray-100 hover:border-blue-200'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                >
                  {/* Corner validity badge with animation */}
                  {user.validUntil && (() => {
                    const info = getValidityInfo(user.validUntil, user.createdAt);
                    if (!info) return null;
                    const badgeClass = info.isValid 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg';
                    return (
                      <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${badgeClass} z-10`}>
                        {info.isValid ? (
                          <div className="flex items-center gap-1">
                            <motion.svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                                <motion.path
                                  d="M20 6L9 17l-5-5"
                                  initial={{ pathLength: 0 }}
                                  animate={{ 
                                    pathLength: [0, 1, 1, 0],
                                    opacity: [0, 1, 1, 0]
                                  }}
                                  transition={{ 
                                    duration: 10,
                                    delay: 0.5,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut",
                                    times: [0, 0.12, 0.92, 1]
                                  }}
                                />
                            </motion.svg>
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: "auto" }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {language === 'en' ? 'Valid' : 'Ansax'}
                            </motion.span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              ✗
                            </motion.span>
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: "auto" }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {language === 'en' ? 'Expired' : 'Dhacay'}
                            </motion.span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Enhanced header with gradient */}
                  <div className={`relative h-28 w-full overflow-hidden ${
                    user.validUntil && new Date() > new Date(user.validUntil)
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
                      : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600'
                  }`}>
                    <div className={`absolute inset-0 ${
                      user.validUntil && new Date() > new Date(user.validUntil)
                        ? 'bg-gradient-to-r from-red-400/20 to-red-500/20'
                        : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                    }`} />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                  </div>

                  {/* INVALID badge for expired users */}
                  {user.validUntil && new Date() > new Date(user.validUntil) && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        INVALID
                      </div>
                    </div>
                  )}

                  {/* Avatar with enhanced styling */}
                  <div className="relative -mt-16 px-6 pb-6">
                    <div className="w-full flex items-center justify-center">
                      {user.profilePicUrl && user.profilePicUrl.trim() !== '' ? (
                        <div className="relative cursor-pointer group/avatar" onClick={() => handleImageClick(user)}>
                          <img
                            src={user.profilePicUrl}
                            alt={user.fullName}
                            className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-2xl transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:shadow-3xl"
                            onError={(e) => {
                              console.log('Profile picture failed to load:', user.profilePicUrl);
                              e.currentTarget.src = '/icons/founder.jpeg';
                            }}
                          />
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                            user.validUntil && new Date() > new Date(user.validUntil)
                              ? 'bg-red-500' // Red status for expired
                              : 'bg-green-500' // Green status for valid
                          }`}>
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white shadow-2xl flex items-center justify-center">
                            <User className="w-12 h-12 text-white" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                            user.validUntil && new Date() > new Date(user.validUntil)
                              ? 'bg-red-500' // Red status for expired
                              : 'bg-green-500' // Green status for valid
                          }`}>
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User Information - Clean Structure */}
                    <div className="mt-4 space-y-3">
                      {/* Name */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 truncate" data-user-name>
                            {user.fullName}
                          </h3>
                          {user.validUntil && new Date() <= new Date(user.validUntil) && (
                            <img 
                              src="/icons/check.png" 
                              alt="Valid" 
                              className="w-5 h-5"
                            />
                          )}
                        </div>
                      </div>

                      {/* Information Grid */}
                      <div className="space-y-2 text-sm">
                        {/* Phone Number */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-600 font-medium flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {language === 'en' ? 'Number' : 'Lambar'}
                      </span>
                          <span className="text-gray-900 font-semibold" data-user-phone>{user.phone}</span>
                        </div>

                        {/* ID Number */}
                        {user.idNumber && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-600 font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {language === 'en' ? 'ID' : 'Aqoonsi'}
                            </span>
                            <span className="text-gray-900 font-semibold" data-user-id>{user.idNumber}</span>
                          </div>
                        )}

                        {/* Registration Date */}
                        {user.createdAt && (
                          <div className="flex items-start justify-between bg-blue-50 rounded-lg px-3 py-2">
                            <span className="text-blue-600 font-medium flex items-center gap-2 flex-shrink-0 text-xs">
                              <Calendar className="w-3 h-3" />
                              {language === 'en' ? 'Registered' : 'Diiwaangashan'}
                            </span>
                            <span className="text-blue-900 font-bold text-right text-sm leading-tight">{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Payment action buttons */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePaymentClick(user)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'en' ? 'Add Payment' : 'Ku Dar Lacag'}</span>
                      </button>
                      <button
                        onClick={() => handleImageClick(user)}
                        className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{language === 'en' ? 'View' : 'Fiiri'}</span>
                      </button>
                    </div>
                  </div>
                  </motion.div>
            ))}
          </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  ), [filteredPaymentUsers, isLoading, language, paymentInputValue, getValidityInfo, handleImageClick, handlePaymentClick]);


  // Render tab content - return memoized values directly
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': 
        return OverviewTab;
      case 'users': 
        return UsersTab;
      case 'payments': 
        return PaymentsTab;
      default: 
        return OverviewTab;
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {language === 'en' ? 'Welcome back, ' : 'Ku soo dhawoow, '}
            <span className="font-semibold text-blue-600">{user?.fullName}</span>
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg border border-gray-200">
            {[
              { id: 'overview', label: language === 'en' ? 'Overview' : 'Dulmar', icon: BarChart3 },
              { id: 'users', label: language === 'en' ? 'Users' : 'Isticmaalayaasha', icon: Users },
              { id: 'payments', label: language === 'en' ? 'Payments' : 'Lacagaha', icon: DollarSign }
            ].map((tab) => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
              </button>
              ))}
          </div>
          </motion.div>

        {/* Add User Form Modal */}
        <AnimatePresence>
          {showAddUserForm && (
            <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
          <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                      <span>{language === 'en' ? 'Add New User' : 'Ku Dar Isticmaale Cusub'}</span>
                    </h2>
                    <button
                      onClick={() => setShowAddUserForm(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <motion.form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{language === 'en' ? 'Full Name' : 'Magaca Buuxa'}</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formState.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                        placeholder={language === 'en' ? 'Enter full name' : 'Geli magaca buuxa'}
                      />
                </motion.div>

                    {/* Phone Number Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>{language === 'en' ? 'Phone Number' : 'Lambarka Telefoonka'}</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <img 
                            src="/icons/Flag_of_Somalia.svg.png"
                            alt="Somalia Flag"
                            className="w-5 h-5 object-cover rounded-sm"
                            title="Somalia"
                          />
                          <span className="text-gray-500 font-medium ml-2">+252</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formState.phone.replace('+252', '')}
                          onChange={(e) => {
                            const value = e.target.value;
                            const fullPhone = '+252' + value;
                            setFormState(prev => ({
                              ...prev,
                              phone: fullPhone
                            }));
                            formRef.current = {
                              ...formRef.current,
                              phone: fullPhone
                            };
                          }}
                          required
                          className="w-full pl-20 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                          placeholder="xxxxxxx"
                        />
                      </div>
              </motion.div>

                    {/* ID Number Field */}
                <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>{language === 'en' ? 'ID Number' : 'Lambarka Aqoonsiga'}</span>
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formState.idNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                        placeholder={language === 'en' ? 'Enter ID number' : 'Geli lambarka aqoonsiga'}
                      />
                    </motion.div>

                    {/* Location Field */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span>{language === 'en' ? 'Location' : 'Goobta'}</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formState.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                        placeholder={language === 'en' ? 'Enter location' : 'Geli goobta'}
                      />
                    </motion.div>

                    {/* Registration Date Field */}
                <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.45 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>{language === 'en' ? 'Registration Date' : 'Taariikhda Diiwaangelinta'}</span>
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formState.registrationDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                      />
                  </motion.div>

                    {/* Amount (months) Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.48 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'en' ? 'Amount (USD)' : 'Lacagta (USD)'}</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="amount"
                        value={formState.amount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                        placeholder={language === 'en' ? 'Enter amount in $ (e.g., 6)' : 'Geli lacagta $ (tusaale, 6)'}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {language === 'en' ? 'Each $ equals 1 month of validity.' : 'Doolar walba wuxuu u dhigmayaa 1 bil ansax ah.'}
                      </p>
                </motion.div>


                    {/* Profile Picture Field */}
                <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <span>{language === 'en' ? 'Profile Picture' : 'Sawirka Isticmaalaha'}</span>
                      </label>
                      
                      <div className="space-y-4">
                        {/* File Input */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                        </div>
                        
                        {/* Image Preview */}
                        {previewImage && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-center"
                          >
                            <div className="relative">
                              <img
                                src={previewImage}
                                alt="Preview"
                                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewImage(null);
                                  formRef.current.profilePic = null;
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                      </motion.div>
                        )}
                      </div>
                        </motion.div>

                    {/* Form Buttons */}
              <motion.div 
                      className="flex space-x-4 pt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            <span>{language === 'en' ? 'Add User' : 'Ku Dar Isticmaale'}</span>
                          </>
                        )}
                </motion.button>

                      <motion.button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                      >
                        <X className="w-5 h-5" />
                        <span>{language === 'en' ? 'Cancel' : 'Jooji'}</span>
                      </motion.button>
              </motion.div>
                  </motion.form>
                </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>


        {/* Profile Picture Modal */}
        {selectedUserImage && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4" 
            onClick={() => setSelectedUserImage(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedUserImage.user.fullName}</h2>
                      <p className="text-blue-100 text-sm">{language === 'en' ? 'Profile Picture' : 'Sawirka Isticmaalaha'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUserImage(null)} className="p-2 hover:bg-white/20 rounded-full">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">{language === 'en' ? 'Profile Picture' : 'Sawirka Isticmaalaha'}</h3>
                    <img
                      src={selectedUserImage.imageUrl}
                      alt={selectedUserImage.user.fullName}
                      className="max-w-full max-h-[40vh] object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        console.log('Profile picture failed to load in modal:', selectedUserImage.imageUrl);
                        e.currentTarget.src = '/icons/founder.jpeg';
                      }}
                    />
                  </div>
                </div>
                

                {/* Balance Display - Compact */}
                {(() => {
                  const balanceInfo = calculateRemainingBalance(selectedUserImage.user.validUntil, selectedUserImage.user.createdAt);
                  return (
                    <div className={`mt-6 p-4 rounded-lg shadow-md ${
                      balanceInfo.isValid 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      <div className="text-center text-white">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <DollarSign className="w-5 h-5" />
                          <h3 className="text-lg font-bold">
                            {language === 'en' ? 'Balance' : 'Xisaabta'}
                          </h3>
              </div>
                        <div className="text-4xl font-extrabold my-2">
                          ${Math.abs(balanceInfo.balance)}
                        </div>
                        <div className="text-sm font-semibold">
                          {balanceInfo.isValid ? (
                            <>
                              {balanceInfo.months} {language === 'en' ? 'month' : 'bil'}{balanceInfo.months !== 1 ? 's' : ''} {language === 'en' ? 'remaining' : 'oo haray'}
                            </>
                          ) : balanceInfo.balance < 0 ? (
                            <>
                              {language === 'en' ? 'Owes' : 'Wuu Leeyahay'}: {Math.abs(balanceInfo.months)} {language === 'en' ? 'month' : 'bil'}{Math.abs(balanceInfo.months) !== 1 ? 's' : ''}
                            </>
                          ) : (
                            language === 'en' ? 'No active subscription' : 'Ma jiro rukunka firfircoon'
                          )}
                        </div>
                        <p className="text-white/80 text-xs mt-1">
                          {language === 'en' ? '$1 = 1 month' : '$1 = 1 bil'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Info Cards */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm">{language === 'en' ? 'Phone' : 'Telefoon'}</h4>
                        <p className="text-gray-600 text-sm break-all">{selectedUserImage.user.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm">{language === 'en' ? 'ID Number' : 'Lambarka Aqoonsiga'}</h4>
                        <p className="text-gray-600 text-sm break-all">{selectedUserImage.user.idNumber || 'Not provided'}</p></div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm">{language === 'en' ? 'Registered' : 'Diiwaangashan'}</h4>
                        <p className="text-gray-600 text-sm">
                          {selectedUserImage.user.createdAt 
                            ? new Date(selectedUserImage.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Not available'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm">{language === 'en' ? 'Expires' : 'Dhacaya'}</h4>
                        <p className="text-gray-600 text-sm">
                          {selectedUserImage.user.validUntil 
                            ? new Date(selectedUserImage.user.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Not set'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-emerald-50 rounded-lg col-span-1 md:col-span-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-700 text-sm">{language === 'en' ? 'Validity Status' : 'Xaaladda Ansaxa'}</h4>
                        <p className="text-emerald-600 font-semibold text-sm">
                          {selectedUserImage.user.validUntil && selectedUserImage.user.createdAt
                            ? (() => {
                                const info = getValidityInfo(selectedUserImage.user.validUntil, selectedUserImage.user.createdAt);
                                return info ? info.text : 'Unable to calculate';
                              })()
                            : 'No validity data'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer Section */}
                {selectedUserImage.user.validUntil && (
                  <div className="mt-4">
                    <CountdownTimer 
                      endDate={selectedUserImage.user.validUntil} 
                      language={language}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setPaymentModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {language === 'en' ? 'Add Payment' : 'Ku Dar Lacag Bixin'}
                    </h2>
                    <p className="text-green-100 text-sm">{paymentModal.user.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    {paymentModal.user.profilePicUrl && paymentModal.user.profilePicUrl.trim() !== '' ? (
                      <img
                        src={paymentModal.user.profilePicUrl}
                        alt={paymentModal.user.fullName}
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{paymentModal.user.fullName}</h3>
                    <p className="text-sm text-gray-600">{paymentModal.user.phone}</p>
                    {paymentModal.user.validUntil && (
                      <p className={`text-xs font-semibold mt-1 ${
                        new Date(paymentModal.user.validUntil) > new Date()
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {new Date(paymentModal.user.validUntil) > new Date()
                          ? `${language === 'en' ? 'Valid until' : 'Ansax ilaa'}: ${new Date(paymentModal.user.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                          : `${language === 'en' ? 'Expired' : 'Dhacay'}: ${new Date(paymentModal.user.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                {paymentModal.user.validUntil && new Date(paymentModal.user.validUntil) < new Date() && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          {language === 'en' ? 'Outstanding Balance' : 'Qadarka La Leeyahay'}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          {(() => {
                            const monthsOwed = calculateMonthsOwed(paymentModal.user.validUntil);
                            return language === 'en'
                              ? `${monthsOwed} month${monthsOwed !== 1 ? 's' : ''} overdue ($${monthsOwed}). Payment will first cover overdue months.`
                              : `${monthsOwed} bil oo dhacay ($${monthsOwed}). Lacag bixintu waxay marka hore dabooli doontaa bilaha dhacay.`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'en' ? 'Payment Amount (USD)' : 'Qaddarka Lacagta (USD)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'en' ? '$1 = 1 month extension' : '$1 = 1 bil oo dheeraad ah'}
                  </p>
                </div>

                {/* Preview */}
                {paymentAmount && parseFloat(paymentAmount) > 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          {language === 'en' ? 'Payment Preview' : 'Muuqaalka Lacag Bixin'}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {(() => {
                            const amount = Math.floor(parseFloat(paymentAmount));
                            const monthsOwed = paymentModal.user.validUntil && new Date(paymentModal.user.validUntil) < new Date()
                              ? calculateMonthsOwed(paymentModal.user.validUntil)
                              : 0;
                            const extensionMonths = Math.max(0, amount - monthsOwed);
                            
                            if (monthsOwed > 0) {
                              if (amount < monthsOwed) {
                                return language === 'en'
                                  ? `Insufficient. Need $${monthsOwed - amount} more to clear overdue balance.`
                                  : `Ma filna. Waxaad u baahan tahay $${monthsOwed - amount} oo dheeraad ah si aad u bixiso qadarka la leeyahay.`;
                              } else if (amount === monthsOwed) {
                                return language === 'en'
                                  ? `Will clear ${monthsOwed} overdue month${monthsOwed !== 1 ? 's' : ''} and make account current.`
                                  : `Waxay bixin doontaa ${monthsOwed} bil oo dhacay oo akoonkaaga hadda ah sameyn doontaa.`;
                              } else {
                                return language === 'en'
                                  ? `Will clear ${monthsOwed} overdue month${monthsOwed !== 1 ? 's' : ''} and add ${extensionMonths} month${extensionMonths !== 1 ? 's' : ''} extension.`
                                  : `Waxay bixin doontaa ${monthsOwed} bil oo dhacay oo ku dari doontaa ${extensionMonths} bil oo dheeraad ah.`;
                              }
                            } else {
                              return language === 'en'
                                ? `Will extend validity by ${amount} month${amount !== 1 ? 's' : ''}.`
                                : `Waxay kordhin doontaa ${amount} bil.`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentModal(null)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {language === 'en' ? 'Cancel' : 'Jooji'}
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" />
                        <span>{language === 'en' ? 'Process Payment' : 'Bixi Lacagta'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={cancelDelete}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {language === 'en' 
                        ? `DELETE ${deleteConfirmation.user.fullName.split(' ')[0].toUpperCase()}` 
                        : `TIRTIR ${deleteConfirmation.user.fullName.split(' ')[0].toUpperCase()}`
                      }
                    </h2>
                    <p className="text-red-100 text-sm">{language === 'en' ? 'This action cannot be undone' : 'Tani lama celin karo'}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  {/* User Profile Picture */}
                  <div className="w-20 h-20 mx-auto mb-4">
                    {deleteConfirmation.user.profilePicUrl && deleteConfirmation.user.profilePicUrl.trim() !== '' ? (
                      <img
                        src={deleteConfirmation.user.profilePicUrl}
                        alt={deleteConfirmation.user.fullName}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-red-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center ring-4 ring-red-200 shadow-lg">
                        <User className="w-10 h-10 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">
                    {language === 'en' ? 'Are you sure you want to delete' : 'Ma hubtaa inaad tirtirto'}
                  </h3>
                  <p className="text-xl font-bold text-red-600 mb-2">{deleteConfirmation.user.fullName}</p>
                  <p className="text-sm text-gray-600">{deleteConfirmation.user.phone}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    {language === 'en' ? 'Cancel' : 'Jooji'}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    {language === 'en' 
                      ? `DELETE ${deleteConfirmation.user.fullName.split(' ')[0].toUpperCase()}` 
                      : `TIRTIR ${deleteConfirmation.user.fullName.split(' ')[0].toUpperCase()}`
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardPage;