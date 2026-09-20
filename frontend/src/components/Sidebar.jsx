import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import LearnerSidebar from './LearnerSidebar';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const isAdmin = Boolean(user?.is_admin || user?.is_staff);

  return isAdmin ? <AdminSidebar /> : <LearnerSidebar />;
}