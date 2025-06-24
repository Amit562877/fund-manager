import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, User, Phone, Calendar } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required.'),
  lastName: Yup.string().required('Last name is required.'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits.')
    .required('Mobile number is required.'),
  gender: Yup.string().required('Gender is required.'),
  birthdate: Yup.string().required('Birthdate is required.'),
  email: Yup.string().email('Invalid email').required('Email is required.'),
  password: Yup.string().min(6, 'Password must be at least 6 characters.').required('Password is required.'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match.')
    .required('Confirm password is required.'),
});

const db = getFirestore();

export default function SignupForm() {
  return (
    <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold text-center mb-4">Sign Up</h2>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          mobile: '',
          gender: '',
          birthdate: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus('');
          try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            // Store extra user info in Firestore
            await setDoc(doc(db, 'users', user.uid), {
              firstName: values.firstName,
              lastName: values.lastName,
              mobile: values.mobile,
              gender: values.gender,
              birthdate: values.birthdate,
              email: values.email,
              createdAt: new Date().toISOString(),
            });
            setStatus('Signup successful!');
          } catch (err: any) {
            setStatus(err.message);
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="text"
                name="firstName"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First Name"
              />
              <ErrorMessage name="firstName" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="text"
                name="lastName"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last Name"
              />
              <ErrorMessage name="lastName" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="tel"
                name="mobile"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mobile Number"
              />
              <ErrorMessage name="mobile" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Field
                as="select"
                name="gender"
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="">Select Gender</option>
                <option value="male">Male ♂️</option>
                <option value="female">Female ♀️</option>
                <option value="other">Other</option>
              </Field>
              <ErrorMessage name="gender" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="date"
                name="birthdate"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Birthdate"
              />
              <ErrorMessage name="birthdate" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="email"
                name="email"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
              <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="password"
                name="password"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
              <ErrorMessage name="password" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Field
                type="password"
                name="confirmPassword"
                className="pl-10 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm Password"
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-xs text-red-500 mt-1" />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : 'Sign Up'}
            </button>
            {status && <div className="mt-4 text-sm text-center text-red-500">{status}</div>}
          </Form>
        )}
      </Formik>
      <div className="mt-2 text-sm text-center">
        <p>
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}