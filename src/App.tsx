import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Network,
  CheckSquare,
  BarChart,
  Plus,
  Search,
  AlertCircle,
  X,
  ChevronRight,
  Menu,
  MoreHorizontal,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Circle,
  MessageSquare,
  ArrowLeft,
  Edit,
  Settings,
  Save,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
} from "lucide-react";

// Import types
import type {
  Profile,
  Company,
  Opportunity,
  Contact,
  Task,
  LogEntry,
  PipelineType,
} from "./types";
import {
  STAGES_DISCOVERY,
  STAGES_APPLICATION,
  STAGES_NETWORKING,
} from "./types";

// Import services
import {
  db,
  getStartOfWeek,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from "./services/DataService";

// Import components
import { LoginScreen } from "./components/LoginScreen";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { TaskList } from "./components/TaskList";
import { KanbanColumn } from "./components/Kanban/KanbanColumn";
import { Sidebar } from "./components/Layout/Sidebar";
import { MobileSidebar } from "./components/Layout/MobileSidebar";
import { MoveModal } from "./components/Modals/MoveModal";

// Force Demo Mode only if we fail to connect
let IS_DEMO_MODE = false;

// View type
type ViewType =
  | "dashboard"
  | "companies"
  | "tasks"
  | "pipeline1"
  | "pipeline2"
  | "pipeline3"
  | "review"
  | "analysis"
  | "settings";

// 5. MAIN APP COMPONENT
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewType>("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);

  // UI State
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Settings State
  const [sbUrl, setSbUrl] = useState(SUPABASE_URL);
  const [sbKey, setSbKey] = useState(SUPABASE_ANON_KEY);
  const [isLive, setIsLive] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  // Auth Form State
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Data State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Coach's Tip
  const [coachTip, setCoachTip] = useState<{
    situation_summary?: string;
    what_matters_most_now?: string;
    action_plan?: string[];
    encouraging_close?: string;
  } | null>(null);
  const [coachTipLoading, setCoachTipLoading] = useState<boolean>(false);

  // Modals & Forms
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecordType, setNewRecordType] = useState<"opportunity" | "contact">(
    "opportunity",
  );
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>({});
  const [analyzingCompany, setAnalyzingCompany] = useState<Company | null>(
    null,
  );
  const [newOppData, setNewOppData] = useState({
    title: "",
    company: "",
    pipeline: "discovery" as PipelineType,
    url: "",
  });
  const [newContactData, setNewContactData] = useState({
    name: "",
    role: "",
    company: "",
  });
  const [taskModal, setTaskModal] = useState<{
    open: boolean;
    type: "create" | "edit";
    taskId?: string;
    entityId?: string;
    entityName?: string;
    entityCompany?: string;
  } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskComments, setNewTaskComments] = useState("");

  // Mobile Move Modal
  const [moveModal, setMoveModal] = useState<{
    open: boolean;
    item: any;
    pipelineType: PipelineType;
  } | null>(null);

  // --- INIT ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      db.init().then(() => {
        setIsLive(db.isLive);
        setAuthUser(db.user);

        if (typeof window !== "undefined") {
          const storedUrl = localStorage.getItem("jobcrm_sb_url");
          const storedKey = localStorage.getItem("jobcrm_sb_key");
          setSbUrl(storedUrl || SUPABASE_URL);
          setSbKey(storedKey || SUPABASE_ANON_KEY);
        }

        loadData();
      });
    };
    document.body.appendChild(script);
  }, []);

  const loadData = async () => {
    const p = await db.getProfile();
    setProfile(p);
    if (p) {
      const [opps, cts, comps, tks, lgs] = await Promise.all([
        db.getOpportunities(),
        db.getContacts(),
        db.getCompanies(),
        db.getTasks(),
        db.getLogs(),
      ]);
      setOpportunities(opps);
      setContacts(cts);
      setCompanies(comps);
      setTasks(tks);
      setLogs(lgs);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    if (sbUrl && sbKey) {
      const success = await db.connect(sbUrl, sbKey);
      if (success) {
        setIsLive(true);
        loadData();
        alert("Connected to Supabase successfully!");
      } else {
        alert("Failed to connect. Check URL/Key or CORS settings.");
      }
    }
  };

  const handleLogin = async (
    email: string,
    pass: string,
    isSignUp: boolean,
  ) => {
    const { data, error } = await db.login(email, pass, isSignUp);
    if (error) {
      throw error;
    } else {
      setAuthUser(data.user);
      db.user = data.user;
      await loadData();
    }
  };

  const handleGuest = () => {
    // Simulate guest session locally (no persistence)
    IS_DEMO_MODE = true;
    db.isLive = false;
    setAuthUser({ email: "guest@demo.local" });
    // Reset local data for clean slate
    setOpportunities([]);
    setContacts([]);
    setCompanies([]);
    setTasks([]);
    setLogs([]);
    setProfile(null);
  };

  const handleLogout = async () => {
    await db.logout();
    setAuthUser(null);
    // Clear local state
    setOpportunities([]);
    setContacts([]);
    setCompanies([]);
    setTasks([]);
    setLogs([]);
    setIsLive(false);
    window.location.reload();
  };

  const handleDisconnect = () => {
    db.disconnect();
    setIsLive(false);
    setSbUrl("");
    setSbKey("");
    window.location.reload();
  };

  const handleOnboardingComplete = async (p: Profile) => {
    await db.saveProfile(p);
    setProfile(p);

    // Only seed if NOT live to prevent spamming DB on every reload if empty
    if (opportunities.length === 0 && !isLive) {
      const demoOpps: Opportunity[] = [
        {
          id: crypto.randomUUID(),
          title: "Firmware Engineer",
          company_name: "Tesla",
          status: "OPPORTUNITY_QUALIFIED",
          pipeline: "discovery",
          priority: "high",
          updated_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          title: "IoT Developer",
          company_name: "Bosch",
          status: "CV_TAILORED",
          pipeline: "application",
          priority: "medium",
          updated_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          title: "Systems Architect",
          company_name: "Siemens",
          status: "SUBMITTED",
          pipeline: "application",
          priority: "medium",
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      const demoContacts: Contact[] = [
        {
          id: crypto.randomUUID(),
          name: "Hans Gruber",
          role_title: "Engineering Manager",
          company_name: "Nakatomi Corp",
          status: "REFERRAL_OR_LEAD",
          updated_at: new Date().toISOString(),
        },
      ];
      const demoCompanies: Company[] = [
        {
          id: crypto.randomUUID(),
          name: "Tesla",
          industry: "Automotive",
          location: "Austin, TX",
          website: "https://tesla.com",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "Bosch",
          industry: "IoT / Electronics",
          location: "Germany",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "Nakatomi Corp",
          industry: "Finance",
          location: "Los Angeles",
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          name: "Siemens",
          industry: "Industrial Automation",
          location: "Munich",
          created_at: new Date().toISOString(),
        },
      ];
      const demoTasks: Task[] = [
        {
          id: crypto.randomUUID(),
          title: "Customize CV for Bosch",
          due_date: new Date().toISOString(),
          is_completed: false,
          related_entity_name: "Bosch",
          comments: "Focus on RTOS experience",
          related_entity_id: demoOpps[1].id,
        },
        {
          id: crypto.randomUUID(),
          title: "Follow up with Siemens Recruiter",
          due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
          is_completed: false,
          related_entity_name: "Siemens",
          related_entity_id: demoOpps[2].id,
        },
      ];

      for (const o of demoOpps) await db.createOpportunity(o);
      for (const c of demoContacts) await db.createContact(c);
      for (const cm of demoCompanies) await db.createCompany(cm);
      for (const t of demoTasks) await db.createTask(t);

      await db.logActivity("moved_stage", "Moved opp to SUBMITTED");
      await db.logActivity("created_contact", "Added contact Hans Gruber");

      setOpportunities(demoOpps);
      setContacts(demoContacts);
      setCompanies(demoCompanies);
      setTasks(demoTasks);
    }
    const lgs = await db.getLogs();
    setLogs(lgs);
  };

  // METRIC CALCULATIONS
  const currentWeekMetrics = useMemo(() => {
    if (!logs.length) return { apps: 0, outreach: 0, completedTasks: 0 };

    const startOfWeek = getStartOfWeek();

    // Filter logs for this week
    const weeklyLogs = logs.filter(
      (l) => new Date(l.created_at) >= startOfWeek,
    );

    const apps = weeklyLogs.filter(
      (l) =>
        (l.action_type === "moved_stage" &&
          (l.details?.includes("SUBMITTED") ||
            l.details?.includes("Application"))) ||
        (l.action_type === "created_opp" && l.details?.includes("Application")),
    ).length;

    const outreach = weeklyLogs.filter(
      (l) =>
        l.action_type === "created_contact" ||
        l.action_type === "outreach_sent",
    ).length;

    const completedTasks = weeklyLogs.filter(
      (l) => l.action_type === "completed_task",
    ).length;

    return { apps, outreach, completedTasks };
  }, [logs]);

  const daysUntilDeadline = useMemo(() => {
    if (!profile?.deadline_date) return 0;
    const diff =
      new Date(profile.deadline_date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }, [profile]);

  // Fetch coach tip once on initial load (with ignore flag to prevent StrictMode double-fire)
  useEffect(() => {
    if (!profile) return;

    let ignore = false;

    const fetchCoachTip = async () => {
      setCoachTipLoading(true);
      try {
        // Build pipeline summary from current data
        const pipelineData = {
          days_remaining: daysUntilDeadline,
          pipelines: {
            discovery: {
              opportunity_found: opportunities.filter(
                (o) => o.pipeline === "discovery" && o.status === "OPPORTUNITY_FOUND"
              ).length,
              opportunity_qualified: opportunities.filter(
                (o) => o.pipeline === "discovery" && o.status === "OPPORTUNITY_QUALIFIED"
              ).length,
            },
            applications: {
              accepted: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "ACCEPTED"
              ).length,
              cv_tailored: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "CV_TAILORED"
              ).length,
              submitted: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "SUBMITTED"
              ).length,
              followed_up: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "FOLLOWED_UP"
              ).length,
              interviewing: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "INTERVIEWING"
              ).length,
              offer: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "OFFER"
              ).length,
              rejected: opportunities.filter(
                (o) => o.pipeline === "application" && o.status === "REJECTED"
              ).length,
            },
            networking: {
              person_identified: contacts.filter(
                (c) => c.status === "PERSON_IDENTIFIED"
              ).length,
              contacted: contacts.filter((c) => c.status === "CONTACTED").length,
              conversation_started: contacts.filter(
                (c) => c.status === "CONVERSATION_STARTED"
              ).length,
              referral_or_lead: contacts.filter(
                (c) => c.status === "REFERRAL_OR_LEAD"
              ).length,
              converted_to_opp: contacts.filter(
                (c) => c.status === "CONVERTED_TO_OPP"
              ).length,
            },
          },
          locale: navigator.language.split("-")[0] || "en",
        };

        // Check if Supabase client is available
        if (!db.supabase) {
          console.log("Supabase client not available, using fallback tip");
          if (!ignore) setCoachTip(null);
          return;
        }

        // Use Supabase client's functions.invoke() to handle CORS properly
        const { data, error } = await db.supabase.functions.invoke("coach-tip", {
          body: pipelineData,
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (ignore) return;

        if (error) {
          console.error("Coach tip error:", error);
          setCoachTip(null);
        } else {
          // Response is wrapped: {success: true, data: {...}}
          const tipData = data?.data || data;
          setCoachTip(tipData);
        }
      } catch (error) {
        console.error("Failed to fetch coach tip:", error);
        if (!ignore) setCoachTip(null);
      } finally {
        if (!ignore) setCoachTipLoading(false);
      }
    };

    fetchCoachTip();

    return () => {
      ignore = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  // --- MOVE HANDLERS (shared by drag-drop and mobile modal) ---
  const handleMoveOpportunity = async (id: string, newStage: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp || opp.status === newStage) return;

    // Optimistic Update
    const updated = {
      ...opp,
      status: newStage,
      updated_at: new Date().toISOString(),
    };
    setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));
    await db.updateOpportunity(id, { status: newStage });

    // Automation: Submitted -> Create Follow Up Task
    if (newStage === "SUBMITTED" && opp.status !== "SUBMITTED") {
      const newTask = {
        id: crypto.randomUUID(),
        title: `Follow up: ${opp.title} (${opp.company_name})`,
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days later
        is_completed: false,
        related_entity_id: id,
        related_entity_name: opp.company_name,
      };
      await db.createTask(newTask);
      setTasks((p) => [...p, newTask]);
    }
    setLogs(await db.getLogs()); // Refresh logs
  };

  const handleMoveContact = async (id: string, newStage: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact || contact.status === newStage) return;

    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: newStage, updated_at: new Date().toISOString() }
          : c,
      ),
    );
    await db.updateContact(id, { status: newStage });
    setLogs(await db.getLogs());
  };

  const onDropOpp = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("id");
    await handleMoveOpportunity(id, newStage);
  };

  const onDropContact = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("id");
    await handleMoveContact(id, newStage);
  };

  const createRecord = async () => {
    if (newRecordType === "opportunity") {
      if (!newOppData.title || !newOppData.company) return;
      const newOpp: Opportunity = {
        id: crypto.randomUUID(),
        title: newOppData.title,
        company_name: newOppData.company,
        pipeline: newOppData.pipeline,
        status:
          newOppData.pipeline === "discovery"
            ? "OPPORTUNITY_FOUND"
            : "ACCEPTED", // MODIFIED DEFAULT
        priority: "medium",
        updated_at: new Date().toISOString(),
        url: newOppData.url || undefined,
      };
      await db.createOpportunity(newOpp);
      setOpportunities((p) => [...p, newOpp]);
    } else {
      if (!newContactData.name || !newContactData.company) return;
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: newContactData.name,
        role_title: newContactData.role,
        company_name: newContactData.company,
        status: "PERSON_IDENTIFIED",
        updated_at: new Date().toISOString(),
      };
      await db.createContact(newContact);
      setContacts((p) => [...p, newContact]);
    }

    setLogs(await db.getLogs());
    setShowAddRecord(false);
    // Reset forms
    setNewOppData({ title: "", company: "", pipeline: "discovery", url: "" });
    setNewContactData({ name: "", role: "", company: "" });
  };

  const handleConvertToApplication = async (opp: Opportunity) => {
    // 1. Create new App Opportunity (Cloned)
    const newAppOpp: Opportunity = {
      ...opp,
      id: crypto.randomUUID(), // New ID for new pipeline entry
      pipeline: "application",
      status: "ACCEPTED",
      updated_at: new Date().toISOString(),
    };
    await db.createOpportunity(newAppOpp);

    // 2. Archive original Discovery Opportunity
    await db.updateOpportunity(opp.id, { status: "ARCHIVED" });

    // 3. Update State
    setOpportunities((prev) => [
      ...prev.map((o) => (o.id === opp.id ? { ...o, status: "ARCHIVED" } : o)), // Archive old
      newAppOpp, // Add new
    ]);

    await db.logActivity(
      "moved_stage",
      `Converted ${opp.title} to Application pipeline`,
    );
    setLogs(await db.getLogs());
  };

  const handleConvertNetworkingToApplication = async (contact: Contact) => {
    // 1. Create new App Opportunity from Contact
    const newAppOpp: Opportunity = {
      id: crypto.randomUUID(),
      company_name: contact.company_name,
      title: contact.role_title || `Referral from ${contact.name}`,
      pipeline: "application",
      status: "ACCEPTED",
      priority: "medium",
      updated_at: new Date().toISOString(),
      description: `Converted from networking contact: ${contact.name}`,
    };
    await db.createOpportunity(newAppOpp);

    // 2. Move original Contact to "Converted to Opp"
    await db.updateContact(contact.id, { status: "CONVERTED_TO_OPP" });

    // 3. Update State
    setOpportunities((prev) => [...prev, newAppOpp]);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id ? { ...c, status: "CONVERTED_TO_OPP" } : c,
      ),
    );

    await db.logActivity(
      "moved_stage",
      `Converted networking contact ${contact.name} to Application pipeline`,
    );
    setLogs(await db.getLogs());
  };

  const openTaskModal = (id: string, name: string, company?: string) => {
    setTaskModal({
      open: true,
      type: "create",
      entityId: id,
      entityName: name,
      entityCompany: company,
    });
    setNewTaskTitle(`Follow up with ${name}`);
    setNewTaskDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]); // tomorrow default
    setNewTaskComments("");
  };

  const handleEditTask = (task: Task) => {
    const relatedOpp = opportunities.find(
      (o) => o.id === task.related_entity_id,
    );
    const relatedContact = contacts.find(
      (c) => c.id === task.related_entity_id,
    );
    const linkedCompany =
      relatedOpp?.company_name || relatedContact?.company_name;

    setTaskModal({
      open: true,
      type: "edit",
      taskId: task.id,
      entityName: task.related_entity_name || "General Task",
      entityCompany: linkedCompany,
    });
    setNewTaskTitle(task.title);
    setNewTaskDate(task.due_date ? task.due_date.split("T")[0] : "");
    setNewTaskComments(task.comments || "");
  };

  const saveTask = async () => {
    if (!taskModal || !newTaskTitle) return;

    if (taskModal.type === "create") {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: newTaskTitle,
        due_date: newTaskDate || new Date().toISOString(),
        is_completed: false,
        related_entity_id: taskModal.entityId,
        related_entity_name: taskModal.entityName,
        comments: newTaskComments,
      };
      await db.createTask(newTask);
      setTasks((p) => [...p, newTask]);
    } else if (taskModal.type === "edit" && taskModal.taskId) {
      const updates = {
        title: newTaskTitle,
        due_date: newTaskDate || new Date().toISOString(),
        comments: newTaskComments,
      };
      await db.updateTask(taskModal.taskId, updates);
      setTasks((p) =>
        p.map((t) => (t.id === taskModal.taskId ? { ...t, ...updates } : t)),
      );
    }
    setTaskModal(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Delete this task?")) {
      await db.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Company Handlers
  const handleOpenCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setCompanyFormData(company);
    } else {
      setEditingCompany(null);
      setCompanyFormData({});
    }
    setShowCompanyModal(true);
  };

  const handleAnalyzeCompany = (company: Company) => {
    setAnalyzingCompany(company);
    setView("analysis");
  };

  const saveCompany = async () => {
    if (!companyFormData.name) return;

    if (editingCompany) {
      // Update
      const updates = { ...companyFormData };
      await db.updateCompany(editingCompany.id, updates);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id ? ({ ...c, ...updates } as Company) : c,
        ),
      );

      // If currently analyzing this company, update that state too
      if (analyzingCompany?.id === editingCompany.id) {
        setAnalyzingCompany({ ...editingCompany, ...updates } as Company);
      }
    } else {
      // Create
      const newCompany: Company = {
        id: crypto.randomUUID(),
        name: companyFormData.name!,
        industry: companyFormData.industry,
        location: companyFormData.location,
        website: companyFormData.website,
        notes: companyFormData.notes,
        created_at: new Date().toISOString(),
      };
      await db.createCompany(newCompany);
      setCompanies((prev) => [...prev, newCompany]);
    }
    setShowCompanyModal(false);
  };

  // Edit Record Logic
  const handleEditRecord = (item: any) => {
    setEditingRecord(item);
    setEditForm({ ...item }); // Clone to avoid direct mutation
  };

  const saveEditedRecord = async () => {
    if (!editingRecord) return;
    const isContact = !!editingRecord.role_title;

    if (isContact) {
      await db.updateContact(editingRecord.id, editForm);
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingRecord.id ? ({ ...c, ...editForm } as Contact) : c,
        ),
      );
    } else {
      await db.updateOpportunity(editingRecord.id, editForm);
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === editingRecord.id
            ? ({ ...o, ...editForm } as Opportunity)
            : o,
        ),
      );
    }
    setEditingRecord(null);
  };

  const handleDeleteOpp = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      await db.deleteOpportunity(id);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await db.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    await db.toggleTask(id, !currentStatus);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );
    // Trigger log refresh to update "Completed Tasks" metric
    const updatedLogs = await db.getLogs();
    setLogs(updatedLogs);
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-blue-600 animate-pulse font-medium">
        Initializing JobOS...
      </div>
    );

  // AUTH WALL
  if (!authUser)
    return <LoginScreen onLogin={handleLogin} onGuest={handleGuest} />;

  if (!profile)
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR - Desktop */}
      <Sidebar
        view={view}
        setView={setView}
        profile={profile}
        isLive={isLive}
        authUser={authUser}
        isSidebarCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* MOBILE DRAWER */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        view={view}
        setView={setView}
        profile={profile}
        isLive={isLive}
        authUser={authUser}
      />

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="hidden lg:block text-lg font-bold text-slate-800">
            {view === "dashboard" && "Daily Command Center"}
            {view === "pipeline1" && "Discovery Pipeline"}
            {view === "pipeline2" && "Application Execution"}
            {view === "pipeline3" && "Networking & Outreach"}
            {view === "companies" && "Company Database"}
            {view === "tasks" && "Master Task List"}
            {view === "review" && "Weekly Analytics"}
            {view === "settings" && "System Settings"}
            {view === "analysis" && (
              <span className="flex items-center gap-2">
                <span className="text-slate-400 font-normal">
                  Company Analysis:
                </span>
                {analyzingCompany?.name}
              </span>
            )}
          </h2>

          <div className="flex items-center gap-6">
            {daysUntilDeadline > 0 ? (
              <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-black text-blue-600 leading-none">
                    {daysUntilDeadline}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Days Left
                </span>
              </div>
            ) : (
              <span className="hidden sm:inline text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">
                Deadline Passed
              </span>
            )}

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white pl-3 pr-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Add Record
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-8 bg-slate-50 scrollbar-thin">
          {view === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
              {/* TOP STATS */}
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Applications (Wk)",
                    val: currentWeekMetrics.apps,
                    target: profile.weekly_targets.applications,
                    color: "blue",
                    icon: Briefcase,
                  },
                  {
                    label: "Outreach (Wk)",
                    val: currentWeekMetrics.outreach,
                    target: profile.weekly_targets.outreaches,
                    color: "purple",
                    icon: Network,
                  },
                  {
                    label: "Active Pipeline",
                    val: opportunities.filter(
                      (o) => o.pipeline === "application",
                    ).length,
                    target: null,
                    color: "emerald",
                    icon: MoreHorizontal,
                  },
                  {
                    label: "Tasks Due",
                    val: tasks.filter((t) => !t.is_completed).length,
                    target: null,
                    color: "amber",
                    icon: CheckSquare,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-300/50 transition-colors"
                  >
                    <div
                      className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${stat.color}-600`}
                    >
                      <stat.icon size={64} />
                    </div>
                    <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider z-10">
                      {stat.label}
                    </p>
                    <div className="flex items-end gap-2 mt-1 z-10">
                      <span className={`text-4xl font-black text-slate-800`}>
                        {stat.val}
                      </span>
                      {stat.target && (
                        <span className="text-sm text-slate-400 mb-1.5 font-semibold">
                          / {stat.target}
                        </span>
                      )}
                    </div>
                    {stat.target && (
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-auto overflow-hidden">
                        <div
                          className={`h-full bg-${stat.color}-500 rounded-full`}
                          style={{
                            width: `${Math.min((stat.val / stat.target) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* LEFT COLUMN: TASKS & LOGS */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[400px]">
                  <TaskList
                    tasks={tasks}
                    toggleTask={handleToggleTask}
                    onEditTask={handleEditTask}
                    opportunities={opportunities}
                    contacts={contacts}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {logs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-4 text-sm items-start group"
                      >
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors flex-shrink-0" />
                        <div>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {log.details}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p className="text-slate-400 text-sm italic">
                        No activity yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PIPELINE SUMMARY */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <BarChart className="w-4 h-4 text-slate-400" />
                    Pipeline Health
                  </h3>
                  <div className="space-y-6">
                    {(() => {
                      const discoveryCount = opportunities.filter(
                        (o) => o.pipeline === "discovery",
                      ).length;
                      const applicationCount = opportunities.filter(
                        (o) => o.pipeline === "application",
                      ).length;
                      const interviewCount = opportunities.filter(
                        (o) => o.status === "INTERVIEWING",
                      ).length;
                      const maxCount = Math.max(discoveryCount, applicationCount, interviewCount, 1);
                      return (
                        <>
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                              <span>Discovery</span>
                              <span>{discoveryCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(discoveryCount / maxCount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                              <span>Applications</span>
                              <span className="text-blue-600">{applicationCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(applicationCount / maxCount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                              <span>Interviews</span>
                              <span className="text-emerald-600">{interviewCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(interviewCount / maxCount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-bold text-xs uppercase tracking-wide mb-3">
                      Coach's Tip
                    </h4>
                    {coachTipLoading ? (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Loading tip...
                      </div>
                    ) : coachTip ? (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700 leading-relaxed">
                          {coachTip.situation_summary}
                        </p>
                        {coachTip.what_matters_most_now && (
                          <div>
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                              Focus
                            </p>
                            <p className="text-sm text-blue-700 leading-relaxed">
                              {coachTip.what_matters_most_now}
                            </p>
                          </div>
                        )}
                        {coachTip.action_plan && coachTip.action_plan.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                              Action Plan
                            </p>
                            <ul className="text-sm text-blue-700 leading-relaxed space-y-1">
                              {coachTip.action_plan.map((action, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-blue-400">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {coachTip.encouraging_close && (
                          <p className="text-sm text-blue-600 italic leading-relaxed pt-2 border-t border-blue-100">
                            {coachTip.encouraging_close}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Keep pushing forward! Every application counts.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === "settings" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-slate-400" />
                  System Settings
                </h2>
                <p className="text-slate-500 mb-8">
                  Configure your database connection.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Connection Status
                    </label>
                    <div
                      className={`p-4 rounded-lg border flex items-center gap-3 ${isLive ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}
                    >
                      {isLive ? (
                        <Wifi className="w-5 h-5" />
                      ) : (
                        <WifiOff className="w-5 h-5" />
                      )}
                      <div>
                        <p className="font-bold">
                          {isLive
                            ? "Connected to Supabase"
                            : "Running in Local Demo Mode"}
                        </p>
                        {authUser ? (
                          <p className="text-xs mt-1">
                            Logged in as: {authUser.email}
                          </p>
                        ) : isLive ? (
                          <p className="text-xs mt-1 text-red-600 font-bold">
                            WARNING: You are connected but NOT logged in. Data
                            will NOT save.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {!authUser && (
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <LogIn size={18} /> Authentication
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        You must create an account to save data to the cloud.
                      </p>

                      <div className="flex bg-white rounded-lg p-1 border border-slate-200 mb-4 w-fit">
                        <button
                          onClick={() => setAuthMode("signin")}
                          className={`px-4 py-1.5 text-sm font-bold rounded ${authMode === "signin" ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => setAuthMode("signup")}
                          className={`px-4 py-1.5 text-sm font-bold rounded ${authMode === "signup" ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}
                        >
                          Sign Up
                        </button>
                      </div>

                      <div className="space-y-3">
                        <input
                          className="w-full p-3 border border-slate-200 rounded-lg"
                          placeholder="Email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                        />
                        <input
                          type="password"
                          className="w-full p-3 border border-slate-200 rounded-lg"
                          placeholder="Password"
                          value={authPass}
                          onChange={(e) => setAuthPass(e.target.value)}
                        />
                        <button
                          onClick={() =>
                            handleLogin(
                              authEmail,
                              authPass,
                              authMode === "signup",
                            )
                          }
                          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                        >
                          {authMode === "signin" ? "Log In" : "Create Account"}
                        </button>
                      </div>
                    </div>
                  )}

                  {authUser && (
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} /> Log Out
                    </button>
                  )}

                  <hr className="border-slate-100 my-4" />

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Supabase URL
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                      placeholder="https://xyz.supabase.co"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleConnect}
                      className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Update Config
                    </button>
                    {isLive && (
                      <button
                        onClick={handleDisconnect}
                        className="px-6 py-3 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KANBAN VIEWS */}
          {(view === "pipeline1" ||
            view === "pipeline2" ||
            view === "pipeline3") && (
            <div className="h-full flex overflow-x-auto snap-x snap-mandatory pb-4 items-start">
              {view === "pipeline1" &&
                STAGES_DISCOVERY.map((stage) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    items={opportunities.filter(
                      (o) => o.pipeline === "discovery" && o.status === stage,
                    )}
                    onDrop={onDropOpp}
                    onDragStart={onDragStart}
                    onScheduleTask={openTaskModal}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteOpp}
                    onConvert={handleConvertToApplication}
                    onDragOver={(e: any) => e.preventDefault()}
                    onMoveClick={(item: any) => setMoveModal({ open: true, item, pipelineType: 'discovery' })}
                  />
                ))}
              {view === "pipeline2" &&
                STAGES_APPLICATION.map((stage) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    items={opportunities.filter(
                      (o) => o.pipeline === "application" && o.status === stage,
                    )}
                    onDrop={onDropOpp}
                    onDragStart={onDragStart}
                    onScheduleTask={openTaskModal}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteOpp}
                    onDragOver={(e: any) => e.preventDefault()}
                    onMoveClick={(item: any) => setMoveModal({ open: true, item, pipelineType: 'application' })}
                  />
                ))}
              {view === "pipeline3" &&
                STAGES_NETWORKING.map((stage) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    items={contacts.filter((c) => c.status === stage)}
                    onDrop={onDropContact}
                    onDragStart={onDragStart}
                    onScheduleTask={openTaskModal}
                    onEdit={handleEditRecord}
                    onDelete={handleDeleteContact}
                    onConvert={handleConvertNetworkingToApplication}
                    onDragOver={(e: any) => e.preventDefault()}
                    onMoveClick={(item: any) => setMoveModal({ open: true, item, pipelineType: 'networking' })}
                  />
                ))}
            </div>
          )}

          {/* COMPANIES TABLE */}
          {view === "companies" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Target Companies
                </h3>
                <button
                  onClick={() => handleOpenCompanyModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Add Company
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Company Name</th>
                      <th className="px-6 py-4">Industry</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Website</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map((company) => (
                      <tr
                        key={company.id}
                        onClick={() => handleAnalyzeCompany(company)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {company.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {company.industry || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {company.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-slate-400" />
                              {company.location}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:underline flex items-center gap-1.5"
                            >
                              <Globe size={14} />
                              Link
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight
                            className="inline text-slate-300 group-hover:text-blue-500"
                            size={16}
                          />
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-slate-400 italic"
                        >
                          No companies tracked yet. Add one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TASKS TABLE */}
          {view === "tasks" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-800">All Tasks</h3>
                <button
                  onClick={() => {
                    setTaskModal({
                      open: true,
                      type: "create",
                      entityId: "",
                      entityName: "General Task",
                    });
                    setNewTaskTitle("");
                    setNewTaskDate(new Date().toISOString().split("T")[0]);
                    setNewTaskComments("");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 w-16">Status</th>
                      <th className="px-6 py-4">Task Description</th>
                      <th className="px-6 py-4">Related To</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 w-16 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...tasks]
                      .sort(
                        (a, b) =>
                          new Date(a.due_date).getTime() -
                          new Date(b.due_date).getTime(),
                      )
                      .map((task) => {
                        const isOverdue =
                          new Date(task.due_date) < new Date() &&
                          !task.is_completed;
                        const relatedOpp = opportunities.find(
                          (o) => o.id === task.related_entity_id,
                        );
                        const relatedContact = contacts.find(
                          (c) => c.id === task.related_entity_id,
                        );
                        const linkedCompany =
                          relatedOpp?.company_name ||
                          relatedContact?.company_name;

                        return (
                          <tr
                            key={task.id}
                            onClick={() => handleEditTask(task)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors group ${task.is_completed ? "bg-slate-50/50" : ""}`}
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTask(task.id, task.is_completed);
                                }}
                                className={`transition-colors ${task.is_completed ? "text-emerald-500" : "text-slate-300 hover:text-blue-500"}`}
                              >
                                {task.is_completed ? (
                                  <CheckCircle2 size={20} />
                                ) : (
                                  <Circle size={20} />
                                )}
                              </button>
                            </td>
                            <td
                              className={`px-6 py-4 font-medium ${task.is_completed ? "text-slate-400 line-through" : "text-slate-800"}`}
                            >
                              <div>{task.title}</div>
                              {task.comments && (
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                  <MessageSquare size={10} /> {task.comments}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {task.related_entity_name ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                  {task.related_entity_name}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {linkedCompany ? (
                                <div className="flex items-center gap-1.5">
                                  <Building2
                                    size={14}
                                    className="text-slate-400"
                                  />
                                  {linkedCompany}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td
                              className={`px-6 py-4 ${isOverdue ? "text-red-600 font-bold" : "text-slate-600"}`}
                            >
                              {new Date(task.due_date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id);
                                }}
                                className="text-slate-300 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    {tasks.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-slate-400 italic"
                        >
                          No tasks scheduled. Time to get to work!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMPANY ANALYSIS VIEW */}
          {view === "analysis" && analyzingCompany && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setView("companies")}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      {analyzingCompany.name}
                      {analyzingCompany.website && (
                        <a
                          href={analyzingCompany.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-blue-600"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      {analyzingCompany.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {analyzingCompany.location}
                        </span>
                      )}
                      {analyzingCompany.industry && (
                        <span className="flex items-center gap-1">
                          <Building2 size={14} /> {analyzingCompany.industry}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenCompanyModal(analyzingCompany)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Edit size={16} /> Edit Details
                </button>
              </div>

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Discovery
                  </p>
                  <p className="text-3xl font-black text-slate-800 mt-2">
                    {
                      opportunities.filter(
                        (o) =>
                          o.company_name === analyzingCompany.name &&
                          o.pipeline === "discovery",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-500">
                    Opportunities tracked
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Applications
                  </p>
                  <p className="text-3xl font-black text-blue-600 mt-2">
                    {
                      opportunities.filter(
                        (o) =>
                          o.company_name === analyzingCompany.name &&
                          o.pipeline === "application",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-500">In progress</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Network
                  </p>
                  <p className="text-3xl font-black text-purple-600 mt-2">
                    {
                      contacts.filter(
                        (c) => c.company_name === analyzingCompany.name,
                      ).length
                    }
                  </p>
                  <p className="text-sm text-slate-500">Contacts identified</p>
                </div>
              </div>

              {/* 3-COLUMN ANALYSIS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* DISCOVERY COLUMN */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Search size={18} /> Discovery & Monitoring
                  </h3>
                  <div className="space-y-3">
                    {opportunities
                      .filter(
                        (o) =>
                          o.company_name === analyzingCompany.name &&
                          o.pipeline === "discovery",
                      )
                      .map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                              {opp.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(opp.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800">
                            {opp.title}
                          </h4>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleEditRecord(opp)}
                              className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    {opportunities.filter(
                      (o) =>
                        o.company_name === analyzingCompany.name &&
                        o.pipeline === "discovery",
                    ).length === 0 && (
                      <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                        No active monitoring.
                      </div>
                    )}
                  </div>
                </div>

                {/* APPLICATIONS COLUMN */}
                <div className="space-y-4">
                  <h3 className="font-bold text-blue-700 flex items-center gap-2 pb-2 border-b border-blue-200">
                    <Briefcase size={18} /> Applications
                  </h3>
                  <div className="space-y-3">
                    {opportunities
                      .filter(
                        (o) =>
                          o.company_name === analyzingCompany.name &&
                          o.pipeline === "application",
                      )
                      .map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm ring-1 ring-blue-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-wider">
                              {opp.status.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(opp.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800">
                            {opp.title}
                          </h4>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleEditRecord(opp)}
                              className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    {opportunities.filter(
                      (o) =>
                        o.company_name === analyzingCompany.name &&
                        o.pipeline === "application",
                    ).length === 0 && (
                      <div className="p-6 text-center border-2 border-dashed border-blue-100 bg-blue-50/50 rounded-lg text-blue-400 text-sm">
                        No active applications.
                      </div>
                    )}
                  </div>
                </div>

                {/* NETWORKING COLUMN */}
                <div className="space-y-4">
                  <h3 className="font-bold text-purple-700 flex items-center gap-2 pb-2 border-b border-purple-200">
                    <Network size={18} /> Network & Contacts
                  </h3>
                  <div className="space-y-3">
                    {contacts
                      .filter((c) => c.company_name === analyzingCompany.name)
                      .map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm ring-1 ring-purple-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                              {contact.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800">
                            {contact.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {contact.role_title}
                          </p>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleEditRecord(contact)}
                              className="text-xs text-purple-600 font-semibold hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    {contacts.filter(
                      (c) => c.company_name === analyzingCompany.name,
                    ).length === 0 && (
                      <div className="p-6 text-center border-2 border-dashed border-purple-100 bg-purple-50/50 rounded-lg text-purple-400 text-sm">
                        No contacts identified.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVIEW VIEW */}
          {view === "review" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  Weekly Performance Review
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Applications Sent
                    </p>
                    <p className="text-4xl font-black text-blue-600 mt-3">
                      {currentWeekMetrics.apps}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Interview Rate
                    </p>
                    <p className="text-4xl font-black text-emerald-600 mt-3">
                      {Math.round(
                        (opportunities.filter(
                          (o) => o.status === "INTERVIEWING",
                        ).length /
                          Math.max(
                            1,
                            opportunities.filter((o) =>
                              [
                                "SUBMITTED",
                                "REJECTED",
                                "OFFER",
                                "INTERVIEWING",
                              ].includes(o.status),
                            ).length,
                          )) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Tasks Cleared
                    </p>
                    <p className="text-4xl font-black text-purple-600 mt-3">
                      {currentWeekMetrics.completedTasks}
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Improvement Experiment
                  </h3>
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-blue-300 transition-all">
                    <textarea
                      className="w-full bg-transparent outline-none text-sm text-slate-700 resize-none"
                      rows={3}
                      placeholder="What is ONE thing you will change next week? (e.g. 'I will customize the first paragraph of every cover letter')"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD RECORD MODAL */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">
                Add New Record
              </h3>
              <button
                onClick={() => setShowAddRecord(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* TYPE SWITCHER */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setNewRecordType("opportunity")}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${newRecordType === "opportunity" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Opportunity
              </button>
              <button
                onClick={() => setNewRecordType("contact")}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${newRecordType === "contact" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Contact
              </button>
            </div>

            {newRecordType === "opportunity" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Role Title
                  </label>
                  <input
                    autoFocus
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="e.g. Senior Firmware Engineer"
                    value={newOppData.title}
                    onChange={(e) =>
                      setNewOppData({ ...newOppData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Company
                  </label>
                  {companies.length > 0 ? (
                    <div className="relative">
                      <select
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white appearance-none"
                        value={newOppData.company}
                        onChange={(e) =>
                          setNewOppData({
                            ...newOppData,
                            company: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Target Company...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      No companies found. Please add a company in the{" "}
                      <button
                        onClick={() => {
                          setShowAddRecord(false);
                          setView("companies");
                        }}
                        className="underline font-bold"
                      >
                        Database
                      </button>{" "}
                      tab first.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Initial Pipeline
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setNewOppData({ ...newOppData, pipeline: "discovery" })
                      }
                      className={`p-3 rounded-lg border text-sm font-semibold transition-all ${newOppData.pipeline === "discovery" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      Discovery
                    </button>
                    <button
                      onClick={() =>
                        setNewOppData({
                          ...newOppData,
                          pipeline: "application",
                        })
                      }
                      className={`p-3 rounded-lg border text-sm font-semibold transition-all ${newOppData.pipeline === "application" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      Active App
                    </button>
                  </div>
                </div>

                {/* Job URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Job URL (Optional)
                  </label>
                  <input
                    type="url"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="https://company.com/careers/job-123"
                    value={newOppData.url}
                    onChange={(e) =>
                      setNewOppData({ ...newOppData, url: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contact Name
                  </label>
                  <input
                    autoFocus
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    placeholder="e.g. Hans Gruber"
                    value={newContactData.name}
                    onChange={(e) =>
                      setNewContactData({
                        ...newContactData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Role/Title
                  </label>
                  <input
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    placeholder="e.g. Hiring Manager"
                    value={newContactData.role}
                    onChange={(e) =>
                      setNewContactData({
                        ...newContactData,
                        role: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Target Company
                  </label>
                  {companies.length > 0 ? (
                    <div className="relative">
                      <select
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium bg-white appearance-none"
                        value={newContactData.company}
                        onChange={(e) =>
                          setNewContactData({
                            ...newContactData,
                            company: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Target Company...</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                      No companies found. Please add a company in the{" "}
                      <button
                        onClick={() => {
                          setShowAddRecord(false);
                          setView("companies");
                        }}
                        className="underline font-bold"
                      >
                        Database
                      </button>{" "}
                      tab first.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddRecord(false)}
                className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createRecord}
                className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-colors"
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE TASK MODAL */}
      {taskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">
                {taskModal.type === "create" ? "Schedule Task" : "Edit Task"}
              </h3>
              <button
                onClick={() => setTaskModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    Linked To
                  </p>
                  {taskModal.entityCompany && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Building2 size={8} /> {taskModal.entityCompany}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-700">
                  {taskModal.entityName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Task Title
                </label>
                <input
                  autoFocus
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Comments
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                  value={newTaskComments}
                  onChange={(e) => setNewTaskComments(e.target.value)}
                  placeholder="Additional details..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setTaskModal(null)}
                className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
              >
                {taskModal.type === "create" ? "Save Task" : "Update Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPANY EDIT MODAL */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">
                {editingCompany ? "Edit Company" : "Add New Company"}
              </h3>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Company Name
                </label>
                <input
                  autoFocus
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="e.g. Acme Corp"
                  value={companyFormData.name || ""}
                  onChange={(e) =>
                    setCompanyFormData({
                      ...companyFormData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Industry
                  </label>
                  <input
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="e.g. IoT"
                    value={companyFormData.industry || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData,
                        industry: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Location
                  </label>
                  <input
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="e.g. Berlin"
                    value={companyFormData.location || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                  <input
                    className="w-full p-3 pl-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="https://..."
                    value={companyFormData.website || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                  placeholder="Hiring freeze until Q3..."
                  value={companyFormData.notes || ""}
                  onChange={(e) =>
                    setCompanyFormData({
                      ...companyFormData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCompany}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
              >
                {editingCompany ? "Save Changes" : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EDIT MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">
                Edit {editingRecord.role_title ? "Contact" : "Opportunity"}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  {editingRecord.role_title ? "Name" : "Title"}
                </label>
                <input
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={editForm.title || editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      [editingRecord.role_title ? "name" : "title"]:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  {editingRecord.role_title ? "Role Title" : "Company"}
                </label>

                {/* CONDITIONAL RENDER: If editing CONTACT (role_title exists), this input is ROLE TITLE */}
                {editingRecord.role_title ? (
                  <input
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                    value={editForm.role_title || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role_title: e.target.value })
                    }
                  />
                ) : (
                  // If editing OPPORTUNITY (no role_title), this input is COMPANY SELECT
                  <div className="relative">
                    <select
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white appearance-none"
                      value={editForm.company_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company_name: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Target Company...</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* SEPARATE COMPANY FIELD FOR CONTACTS */}
              {editingRecord.role_title && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-medium bg-white appearance-none"
                      value={editForm.company_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          company_name: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Target Company...</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Priority
                </label>
                <select
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none bg-white"
                  value={editForm.priority || "medium"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Job URL - for opportunities only */}
              {!editingRecord.role_title && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Job URL
                  </label>
                  <input
                    type="url"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="https://company.com/careers/job-123"
                    value={editForm.url || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, url: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                  value={editForm.notes || editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      [editingRecord.role_title ? "notes" : "description"]:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedRecord}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MOVE MODAL */}
      <MoveModal
        moveModal={moveModal}
        setMoveModal={setMoveModal}
        onMoveOpportunity={handleMoveOpportunity}
        onMoveContact={handleMoveContact}
      />
    </div>
  );
}
