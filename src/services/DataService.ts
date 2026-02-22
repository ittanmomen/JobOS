import type { Profile, Company, Opportunity, Contact, Task, LogEntry } from '../types';

// --- CONFIGURATION ---
const SUPABASE_URL = "https://zkwleomajcojnlvivppb.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2xlb21hamNvam5sdml2cHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjYwNDAsImV4cCI6MjA4NDgwMjA0MH0.9Npg1-ScaBco3TqiSkEZXMtCzJzF3qeg7WoUP3OaNRQ";

// Force Demo Mode only if we fail to connect
let IS_DEMO_MODE = false;

export { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO_MODE };

// --- DATA SERVICE ---

export class DataService {
  supabase: any = null;
  isLive: boolean = false;
  user: any = null;

  constructor() {
    // defer init to useEffect
  }

  async init() {
    if (typeof window !== "undefined") {
      const url = localStorage.getItem("jobcrm_sb_url") || SUPABASE_URL;
      const key = localStorage.getItem("jobcrm_sb_key") || SUPABASE_ANON_KEY;

      if (url && key) {
        await this.connect(url, key);
      }
    }
  }

  async connect(url: string, key: string): Promise<boolean> {
    try {
      // @ts-ignore
      if (window.supabase) {
        // @ts-ignore
        this.supabase = window.supabase.createClient(url, key);

        // Check session
        const {
          data: { session },
        } = await this.supabase.auth.getSession();
        this.user = session?.user || null;

        this.isLive = true;
        IS_DEMO_MODE = false;

        localStorage.setItem("jobcrm_sb_url", url);
        localStorage.setItem("jobcrm_sb_key", key);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to connect to Supabase:", e);
      this.isLive = false;
      IS_DEMO_MODE = true;
      return false;
    }
  }

  async login(email: string, pass: string, isSignUp: boolean) {
    if (!this.supabase)
      return { data: null, error: { message: "No client connection" } };

    if (isSignUp) {
      return await this.supabase.auth.signUp({ email, password: pass });
    } else {
      return await this.supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
    }
  }

  async logout() {
    if (this.supabase) await this.supabase.auth.signOut();
    this.user = null;
  }

  disconnect() {
    this.supabase = null;
    this.isLive = false;
    IS_DEMO_MODE = true;
    localStorage.removeItem("jobcrm_sb_url");
    localStorage.removeItem("jobcrm_sb_key");
  }

  private loadLocal(key: string) {
    if (typeof window === "undefined") return [];
    const item = localStorage.getItem(`jobcrm_${key}`);
    return item ? JSON.parse(item) : [];
  }

  private saveLocal(key: string, data: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`jobcrm_${key}`, JSON.stringify(data));
  }

  // --- CRUD WRAPPERS ---

  // PROFILES
  async getProfile(): Promise<Profile | null> {
    if (!this.isLive) {
      const p = localStorage.getItem("jobcrm_profile");
      return p ? JSON.parse(p) : null;
    }
    const { data } = await this.supabase.from("profiles").select("*").single();
    return data;
  }

  async saveProfile(profile: Profile): Promise<void> {
    if (!this.isLive) {
      localStorage.setItem("jobcrm_profile", JSON.stringify(profile));
      return;
    }
    const user = await this.supabase.auth.getUser();
    if (user.data.user) {
      await this.supabase
        .from("profiles")
        .upsert({ ...profile, id: user.data.user.id });
    }
  }

  // COMPANIES
  async getCompanies(): Promise<Company[]> {
    if (!this.isLive) return this.loadLocal("companies");
    const { data } = await this.supabase.from("companies").select("*");
    return data || [];
  }

  async createCompany(company: Company): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("companies");
      list.push(company);
      this.saveLocal("companies", list);
      await this.logActivity(
        "new_company",
        `Added target company: ${company.name}`,
      );
      return;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) {
      console.error("No user logged in, cannot create company");
      return;
    }
    const { error } = await this.supabase
      .from("companies")
      .insert({ ...company, user_id: user.id });

    if (error) console.error("Supabase Create Company Error:", error);
    else
      await this.logActivity(
        "new_company",
        `Added target company: ${company.name}`,
      );
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("companies");
      const idx = list.findIndex((c: Company) => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        this.saveLocal("companies", list);
      }
      return;
    }
    await this.supabase
      .from("companies")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  // OPPORTUNITIES
  async getOpportunities(): Promise<Opportunity[]> {
    if (!this.isLive) return this.loadLocal("opportunities");
    const { data } = await this.supabase.from("opportunities").select("*");
    return data || [];
  }

  async createOpportunity(opp: Opportunity): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("opportunities");
      list.push(opp);
      this.saveLocal("opportunities", list);
      await this.logActivity(
        "created_opp",
        `New opportunity: ${opp.title} at ${opp.company_name}`,
      );
      return;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;
    const { error } = await this.supabase
      .from("opportunities")
      .insert({ ...opp, user_id: user.id });

    if (error) console.error("Supabase Create Opp Error:", error);
    else
      await this.logActivity(
        "created_opp",
        `New opportunity: ${opp.title} at ${opp.company_name}`,
      );
  }

  async updateOpportunity(
    id: string,
    updates: Partial<Opportunity>,
  ): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("opportunities");
      const idx = list.findIndex((o: Opportunity) => o.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        this.saveLocal("opportunities", list);
        if (updates.status)
          await this.logActivity(
            "moved_stage",
            `Moved opp to ${updates.status}`,
          );
      }
      return;
    }
    await this.supabase
      .from("opportunities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    // Explicitly log status changes in Live mode
    if (updates.status) {
      await this.logActivity("moved_stage", `Moved opp to ${updates.status}`);
    }
  }

  async deleteOpportunity(id: string): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("opportunities").filter(
        (o: Opportunity) => o.id !== id,
      );
      this.saveLocal("opportunities", list);
      return;
    }
    await this.supabase.from("opportunities").delete().eq("id", id);
  }

  // CONTACTS
  async getContacts(): Promise<Contact[]> {
    if (!this.isLive) return this.loadLocal("contacts");
    const { data } = await this.supabase.from("contacts").select("*");
    return data || [];
  }

  async createContact(contact: Contact): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("contacts");
      list.push(contact);
      this.saveLocal("contacts", list);
      await this.logActivity(
        "created_contact",
        `Added contact ${contact.name} at ${contact.company_name}`,
      );
      return;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;
    const { error } = await this.supabase
      .from("contacts")
      .insert({ ...contact, user_id: user.id });

    if (error) console.error("Supabase Create Contact Error:", error);
    else
      await this.logActivity(
        "created_contact",
        `Added contact ${contact.name} at ${contact.company_name}`,
      );
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("contacts");
      const idx = list.findIndex((c: Contact) => c.id === id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        this.saveLocal("contacts", list);
      }
      return;
    }
    await this.supabase
      .from("contacts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updates.status) {
      if (updates.status === "CONTACTED")
        await this.logActivity(
          "outreach_sent",
          `Contacted ${updates.name || "contact"}`,
        );
    }
  }

  async deleteContact(id: string): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("contacts").filter(
        (c: Contact) => c.id !== id,
      );
      this.saveLocal("contacts", list);
      return;
    }
    await this.supabase.from("contacts").delete().eq("id", id);
  }

  // TASKS
  async getTasks(): Promise<Task[]> {
    if (!this.isLive) return this.loadLocal("tasks");
    const { data } = await this.supabase.from("tasks").select("*");
    return data || [];
  }

  async createTask(task: Task): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("tasks");
      list.push(task);
      this.saveLocal("tasks", list);
      return;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;
    const { error } = await this.supabase
      .from("tasks")
      .insert({ ...task, user_id: user.id });
    if (error) console.error("Supabase Create Task Error:", error);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("tasks");
      const idx = list.findIndex((t: Task) => t.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        this.saveLocal("tasks", list);
      }
      return;
    }
    await this.supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async toggleTask(id: string, is_completed: boolean): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("tasks");
      const idx = list.findIndex((t: Task) => t.id === id);
      if (idx !== -1) {
        list[idx].is_completed = is_completed;
        this.saveLocal("tasks", list);
        if (is_completed)
          await this.logActivity("completed_task", "Task completed");
      }
      return;
    }
    await this.supabase
      .from("tasks")
      .update({ is_completed, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (is_completed)
      await this.logActivity("completed_task", "Task completed");
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.isLive) {
      const list = this.loadLocal("tasks").filter((t: Task) => t.id !== id);
      this.saveLocal("tasks", list);
      return;
    }
    await this.supabase.from("tasks").delete().eq("id", id);
  }

  // LOGS
  async getLogs(): Promise<LogEntry[]> {
    if (!this.isLive) return this.loadLocal("logs").reverse();
    const { data } = await this.supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false });
    return data || [];
  }

  async logActivity(type: string, details: string) {
    if (!this.isLive) {
      const list = this.loadLocal("logs");
      list.push({
        id: crypto.randomUUID(),
        action_type: type,
        details,
        created_at: new Date().toISOString(),
      });
      this.saveLocal("logs", list);
      return;
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) return;
    await this.supabase
      .from("activity_log")
      .insert({ action_type: type, details: details, user_id: user.id });
  }
}

export const db = new DataService();

// --- HELPER FUNCTIONS ---

export const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
