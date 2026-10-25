import { create } from "zustand";
import { subscribeAuth } from "../services/authService";

let unsubAuth = null;

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  universityId: null,
  groupId: null,
  lastName: "",
  firstName: "",
  middleName: "",
  phone: "",
  loading: true,

  init: () => {
    if (unsubAuth) return;
    unsubAuth = subscribeAuth((user, profile) => {
      if (!user) {
        set({
          user: null, role: null, universityId: null, groupId: null,
          lastName: "", firstName: "", middleName: "", phone: "",
          loading: false,
        });
        return;
      }
      if (!profile) {
        set({
          user, role: null, universityId: null, groupId: null,
          lastName: "", firstName: "", middleName: "", phone: "",
          loading: false,
        });
        return;
      }
      set({
        user,
        role: profile.role ?? null,
        universityId: profile.universityId ?? null,
        groupId: profile.groupId ?? null,
        lastName: profile.lastName ?? "",
        firstName: profile.firstName ?? "",
        middleName: profile.middleName ?? "",
        phone: profile.phone ?? "",
        loading: false,
      });
    });
  },

  applyProfile: (user, profile) => set({
    user: user ?? null,
    role: profile?.role ?? null,
    universityId: profile?.universityId ?? null,
    groupId: profile?.groupId ?? null,
    lastName: profile?.lastName ?? "",
    firstName: profile?.firstName ?? "",
    middleName: profile?.middleName ?? "",
    phone: profile?.phone ?? "",
    loading: false,
  }),

  setUser: (user, role, universityId, groupId = null) =>
    set({ user, role, universityId, groupId, loading: false }),

  clear: () =>
    set({
      user: null, role: null, universityId: null, groupId: null,
      lastName: "", firstName: "", middleName: "", phone: "",
      loading: false,
    }),
}));