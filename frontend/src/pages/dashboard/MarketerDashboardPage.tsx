import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    User,
    Phone,
    MapPin,
    Calendar,
    CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import { pendingCustomerService, PendingCustomer } from '../../services/pendingCustomerService.ts';
import { marketerService } from '../../services/marketerService.ts';
import { uploadService } from '../../services/uploadService.ts';

const MarketerDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { language } = useTheme();

    const [earnings, setEarnings] = useState({ totalEarnings: 0, approvedCustomers: 0, commissionRate: 0.40 });
    const [pendingCustomers, setPendingCustomers] = useState<PendingCustomer[]>([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '+25261',
        idNumber: '',
        location: '',
        registrationDate: new Date().toISOString().split('T')[0],
        amount: '1',
        profilePic: null as File | null
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Load marketer earnings
    const loadEarnings = useCallback(async () => {
        if (!user?._id) return;
        try {
            const data = await marketerService.getMarketerEarnings(user._id);
            setEarnings(data);
        } catch (error) {
            console.error('Error loading earnings:', error);
        }
    }, [user]);

    // Load pending customers
    const loadPendingCustomers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await pendingCustomerService.getMyPendingCustomers({ limit: 100 });
            setPendingCustomers(data.pendingCustomers);
            setStats(data.stats);
        } catch (error) {
            console.error('Error loading pending customers:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEarnings();
        loadPendingCustomers();
    }, [loadEarnings, loadPendingCustomers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            let phoneValue = value;
            if (value && !value.startsWith('+252')) {
                if (value.startsWith('61')) {
                    phoneValue = '+252' + value;
                } else if (value.startsWith('252')) {
                    phoneValue = '+' + value;
                } else {
                    phoneValue = '+25261' + value;
                }
            }
            setFormData(prev => ({ ...prev, [name]: phoneValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, profilePic: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Upload profile picture if provided
            let profilePicUrl: string | undefined = undefined;
            if (formData.profilePic) {
                const validation = uploadService.validateFile(formData.profilePic);
                if (!validation.isValid) {
                    throw new Error(validation.error || 'Invalid image file');
                }
                const uploadResp = await uploadService.uploadFile(formData.profilePic);
                if (!uploadResp?.success || !uploadResp?.data?.url) {
                    throw new Error('Failed to upload profile picture');
                }
                profilePicUrl = uploadResp.data.url;
            }

            await pendingCustomerService.createPendingCustomer({
                fullName: formData.fullName,
                phone: formData.phone,
                idNumber: formData.idNumber,
                location: formData.location,
                profilePicUrl,
                registrationDate: formData.registrationDate,
                amount: parseInt(formData.amount)
            });

            // Reset form
            setFormData({
                fullName: '',
                phone: '+25261',
                idNumber: '',
                location: '',
                registrationDate: new Date().toISOString().split('T')[0],
                amount: '1',
                profilePic: null
            });
            setPreviewImage(null);
            setShowAddCustomerForm(false);

            // Reload customers
            loadPendingCustomers();

            alert(language === 'en' ? 'Customer submitted for approval!' : 'Macmiilka waxaa loo soo gudbiyay ogolaan!');
        } catch (error: any) {
            console.error('Error creating customer:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = statusFilter === 'all'
        ? pendingCustomers
        : pendingCustomers.filter(c => c.status === statusFilter);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        {language === 'en' ? 'Marketer Dashboard' : 'Dashboard Suuq-geeyaha'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'en' ? `Welcome back, ${user?.fullName}!` : `Ku soo dhawoow, ${user?.fullName}!`}
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {language === 'en' ? 'Total Earnings' : 'Wadarta Dakhliga'}
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                    ${earnings.totalEarnings.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    ${earnings.commissionRate} {language === 'en' ? 'per customer' : 'macmiil kastaa'}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {language === 'en' ? 'Approved Customers' : 'Macaamiisha La Ogolaaday'}
                                </p>
                                <p className="text-3xl font-bold text-blue-600">{earnings.approvedCustomers}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {language === 'en' ? 'Pending' : 'Sugitaan'}
                                </p>
                                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Add Customer Button */}
                {!showAddCustomerForm && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAddCustomerForm(true)}
                        className="mb-6 btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {language === 'en' ? 'Add New Customer' : 'Ku Dar Macmiil Cusub'}
                    </motion.button>
                )}

                {/* Add Customer Form */}
                {showAddCustomerForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-6">
                            {language === 'en' ? 'Add New Customer' : 'Ku Dar Macmiil Cusub'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'Full Name' : 'Magaca Oo Dhan'}
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder={language === 'en' ? 'Enter full name' : 'Geli magaca oo dhan'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'Phone Number' : 'Lambarka Telefoonka'}
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="+25261XXXXXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CreditCard className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'ID Number' : 'Lambarka Aqoonsiga'}
                                    </label>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        value={formData.idNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder={language === 'en' ? 'Enter ID number' : 'Geli lambarka aqoonsiga'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'Location' : 'Goobta'}
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder={language === 'en' ? 'Enter location' : 'Geli goobta'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'Registration Date' : 'Taariikhda Diiwaan-Gelinta'}
                                    </label>
                                    <input
                                        type="date"
                                        name="registrationDate"
                                        value={formData.registrationDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <DollarSign className="inline w-4 h-4 mr-1" />
                                        {language === 'en' ? 'Months (Amount)' : 'Bilaha (Qaddarka)'}
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        max="120"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="6"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {language === 'en' ? 'Profile Picture' : 'Sawirka Profile-ka'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    />
                                    {previewImage && (
                                        <img src={previewImage} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 btn-primary py-3"
                                >
                                    {isLoading ? (language === 'en' ? 'Submitting...' : 'Soo gudbinaya...') : (language === 'en' ? 'Submit for Approval' : 'U Soo Gudbiso Ogolaansho')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddCustomerForm(false);
                                        setFormData({
                                            fullName: '',
                                            phone: '+25261',
                                            idNumber: '',
                                            location: '',
                                            registrationDate: new Date().toISOString().split('T')[0],
                                            amount: '1',
                                            profilePic: null
                                        });
                                        setPreviewImage(null);
                                    }}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    {language === 'en' ? 'Cancel' : 'Laabo'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Customers List */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">
                            {language === 'en' ? 'My Customers' : 'Macaamiishayda'}
                        </h2>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">{language === 'en' ? 'All' : 'Dhammaan'}</option>
                            <option value="pending">{language === 'en' ? 'Pending' : 'Sugitaan'} ({stats.pending})</option>
                            <option value="approved">{language === 'en' ? 'Approved' : 'La Ogolaaday'} ({stats.approved})</option>
                            <option value="rejected">{language === 'en' ? 'Rejected' : 'La Diiday'} ({stats.rejected})</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {filteredCustomers.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                                {language === 'en' ? 'No customers found' : 'Macaamiil lama helin'}
                            </p>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <motion.div
                                    key={customer._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-4">
                                        {customer.profilePicUrl ? (
                                            <img
                                                src={customer.profilePicUrl}
                                                alt={customer.fullName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6 text-blue-600" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900">{customer.fullName}</p>
                                            <p className="text-sm text-gray-500">{customer.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                {new Date(customer.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {customer.amount} {language === 'en' ? 'months' : 'bilood'}
                                            </p>
                                        </div>
                                        <div>
                                            {customer.status === 'pending' && (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {language === 'en' ? 'Pending' : 'Sugitaan'}
                                                </span>
                                            )}
                                            {customer.status === 'approved' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {language === 'en' ? 'Approved' : 'La Ogolaaday'}
                                                </span>
                                            )}
                                            {customer.status === 'rejected' && (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" />
                                                    {language === 'en' ? 'Rejected' : 'La Diiday'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketerDashboardPage;
