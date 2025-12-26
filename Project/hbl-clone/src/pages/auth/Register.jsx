// Register.jsx - HBL Clone
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import FormSelect from '../../components/auth/FormSelect';
import ErrorMessage from '../../components/auth/ErrorMessage';
import SubmitButton from '../../components/auth/SubmitButton';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/register`;

const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
];

export default function Register() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        cnic: '',
        dateOfBirth: '',
        gender: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: ''
        }
    });
    const [files, setFiles] = useState({
        profilePicture: null,
        cnicFront: null,
        cnicBack: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            setForm({
                ...form,
                address: { ...form.address, [name.split('.')[1]]: value }
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleFileChange = e => {
        const { name, files: fileList } = e.target;
        if (fileList && fileList[0]) {
            setFiles(prev => ({
                ...prev,
                [name]: fileList[0]
            }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate files
        if (!files.profilePicture || !files.cnicFront || !files.cnicBack) {
            setError('Please upload all required images: Profile Picture, CNIC Front, and CNIC Back');
            setLoading(false);
            return;
        }

        try {
            // Create FormData for multipart form submission
            const formData = new FormData();

            // Add text fields
            formData.append('firstName', form.firstName);
            formData.append('lastName', form.lastName);
            formData.append('email', form.email);
            formData.append('password', form.password);
            formData.append('phone', form.phone);
            formData.append('cnic', form.cnic);
            formData.append('dateOfBirth', form.dateOfBirth);
            formData.append('gender', form.gender);
            formData.append('address', JSON.stringify(form.address));

            // Add files
            formData.append('profilePicture', files.profilePicture);
            formData.append('cnicFront', files.cnicFront);
            formData.append('cnicBack', files.cnicBack);

            const res = await fetch(API_URL, {
                method: 'POST',
                body: formData // Don't set Content-Type header, let browser set it
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Registration failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Navigate based on user role (typically customer for registration)
            switch (data.user.role) {
                case 'admin':
                case 'manager':
                    navigate('/admin/dashboard');
                    break;
                case 'customer':
                default:
                    navigate('/customer/dashboard');
                    break;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Create Your Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage message={error} />

                {/* Personal Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-heading-2 border-b theme-border pb-2">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="First Name"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                            required
                        />

                        <FormInput
                            label="Last Name"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                            required
                        />
                    </div>

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter a strong password"
                        minLength={8}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Phone Number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="03001234567"
                            required
                        />

                        <FormInput
                            label="CNIC"
                            name="cnic"
                            value={form.cnic}
                            onChange={handleChange}
                            placeholder="12345-1234567-1"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            required
                        />

                        <FormSelect
                            label="Gender"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            options={genderOptions}
                            required
                        />
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-heading-2 border-b theme-border pb-2">
                        Address Information
                    </h3>

                    <FormInput
                        label="Street Address"
                        name="address.street"
                        value={form.address.street}
                        onChange={handleChange}
                        placeholder="Enter your street address"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="City"
                            name="address.city"
                            value={form.address.city}
                            onChange={handleChange}
                            placeholder="Enter your city"
                            required
                        />

                        <FormInput
                            label="State/Province"
                            name="address.state"
                            value={form.address.state}
                            onChange={handleChange}
                            placeholder="Enter your state"
                            required
                        />
                    </div>

                    <FormInput
                        label="Postal Code"
                        name="address.postalCode"
                        value={form.address.postalCode}
                        onChange={handleChange}
                        placeholder="Enter postal code"
                        required
                    />
                </div>

                {/* Required Documents */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold theme-heading-2 border-b theme-border pb-2">
                        Required Documents
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-2">
                                Profile Picture *
                            </label>
                            <input
                                type="file"
                                name="profilePicture"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.profilePicture && (
                                <p className="text-sm text-green-600 mt-1">
                                    Selected: {files.profilePicture.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-2">
                                CNIC Front Side *
                            </label>
                            <input
                                type="file"
                                name="cnicFront"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.cnicFront && (
                                <p className="text-sm text-green-600 mt-1">
                                    Selected: {files.cnicFront.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium theme-text-primary mb-2">
                                CNIC Back Side *
                            </label>
                            <input
                                type="file"
                                name="cnicBack"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="w-full p-3 border theme-border rounded-lg theme-bg-secondary theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.cnicBack && (
                                <p className="text-sm text-green-600 mt-1">
                                    Selected: {files.cnicBack.name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Important:</strong> Please ensure all images are clear and readable.
                            Supported formats: JPG, PNG, GIF. Maximum file size: 5MB per image.
                        </p>
                    </div>
                </div>

                <SubmitButton loading={loading ? 'Creating Account...' : false}>
                    Create Account
                </SubmitButton>

                <div className="text-center pt-4">
                    <p className="text-sm theme-text-secondary">
                        Already have an account?{' '}
                        <Link
                            to="/auth/login"
                            className="theme-accent hover:underline font-medium"
                        >
                            Login here
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
