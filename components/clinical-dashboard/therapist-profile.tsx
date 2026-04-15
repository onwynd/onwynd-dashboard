"use client";

import { useEffect, useState } from "react";
import { clinicalService } from "@/lib/api/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserCheck, UserX, AlertCircle, CheckCircle } from "lucide-react";

interface TherapistProfile {
  id?: string;
  user_id?: string;
  status?: "pending" | "approved" | "rejected";
  is_available?: boolean;
  is_verified?: boolean;
  hourly_rate?: number;
  specializations?: string[];
  bio?: string;
  verification_documents?: any[];
  created_at?: string;
  updated_at?: string;
}

export function ClinicalTherapistProfile() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    specializations: [""],
    hourly_rate: 15000,
    is_accepting_clients: true,
  });

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const response = await clinicalService.getTherapistProfile();
      setProfile(response?.data || null);
    } catch (error) {
      console.error("Failed to fetch therapist profile:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (isAvailable: boolean) => {
    if (!profile?.id) return;
    
    try {
      setToggling(true);
      await clinicalService.toggleTherapistMode(isAvailable);
      
      setProfile(prev => prev ? { ...prev, is_available: isAvailable } : null);
      
      toast({
        title: "Success",
        description: isAvailable ? "You are now available for therapy sessions" : "You are now unavailable for therapy sessions",
      });
    } catch (error) {
      console.error("Failed to toggle therapist mode:", error);
      toast({
        title: "Error",
        description: "Failed to update therapist status",
        variant: "destructive",
      });
    } finally {
      setToggling(false);
    }
  };

  const handleCreateTherapistProfile = async () => {
    try {
      setCreatingProfile(true);
      
      // Validate form data
      if (!formData.bio.trim() || formData.specializations.some(spec => !spec.trim())) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Create therapist profile for clinical advisor with form data
      const profileData = {
        bio: formData.bio.trim(),
        specializations: formData.specializations.filter(spec => spec.trim()),
        hourly_rate: formData.hourly_rate,
        is_accepting_clients: formData.is_accepting_clients,
      };
      
      await clinicalService.createTherapistProfile(profileData);
      setShowCreateForm(false);
      await fetchTherapistProfile();
      
      toast({
        title: "Success",
        description: "Therapist profile created successfully",
      });
    } catch (error) {
      console.error("Failed to create therapist profile:", error);
      toast({
        title: "Error",
        description: "Failed to create therapist profile",
        variant: "destructive",
      });
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, ""]
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const updateSpecialization = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }));
  };

  useEffect(() => {
    fetchTherapistProfile();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading therapist profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Therapist Profile Not Found
          </CardTitle>
          <CardDescription>
            You don't have a therapist profile yet. Create one to start providing therapy services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCreateForm ? (
            <Button 
              onClick={() => setShowCreateForm(true)} 
              disabled={creatingProfile}
              className="w-full sm:w-auto"
            >
              {creatingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Create Therapist Profile
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about your therapeutic approach and experience..."
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Specializations *</Label>
                  {formData.specializations.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => updateSpecialization(index, e.target.value)}
                        placeholder="e.g., Cognitive Behavioral Therapy"
                        className="flex-1 p-2 border rounded-md"
                        required
                      />
                      {formData.specializations.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpecialization(index)}
                          className="px-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSpecialization}
                    className="w-full"
                  >
                    + Add Specialization
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (₦) *</Label>
                  <input
                    id="hourly_rate"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', parseInt(e.target.value) || 0)}
                    min="1000"
                    step="1000"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    id="is_accepting_clients"
                    type="checkbox"
                    checked={formData.is_accepting_clients}
                    onChange={(e) => handleInputChange('is_accepting_clients', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_accepting_clients" className="mb-0">
                    Accepting new clients
                  </Label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTherapistProfile}
                  disabled={creatingProfile}
                  className="flex-1"
                >
                  {creatingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creatingProfile}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const isApproved = profile.status === "approved";
  const isAvailable = profile.is_available === true;
  const canToggleAvailability = isApproved && profile.is_verified;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Therapist Profile
          </CardTitle>
          <Badge 
            variant={isApproved ? "default" : profile.status === "pending" ? "secondary" : "destructive"}
          >
            {profile.status || "Unknown"}
          </Badge>
        </div>
        <CardDescription>
          Manage your therapist profile and availability status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          {isApproved ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isApproved 
                ? "Your therapist profile is approved and verified" 
                : profile.status === "pending" 
                ? "Your therapist profile is pending approval" 
                : "Your therapist profile was rejected"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {profile.status === "pending" 
                ? "This usually takes 1-3 business days" 
                : "Contact support if you need assistance"
              }
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        {canToggleAvailability && (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <Label htmlFor="availability-toggle" className="font-medium">
                  Available for Therapy Sessions
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? "Patients can book sessions with you" : "Patients cannot book sessions with you"}
                </p>
              </div>
            </div>
            <Switch
              id="availability-toggle"
              checked={isAvailable}
              onCheckedChange={handleToggleAvailability}
              disabled={toggling}
            />
          </div>
        )}

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Specializations</Label>
            <div className="flex flex-wrap gap-1">
              {profile.specializations?.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              )) || (
                <span className="text-sm text-muted-foreground">No specializations listed</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hourly Rate</Label>
            <p className="text-sm font-medium">
              ₦{profile.hourly_rate?.toLocaleString() || "Not set"}
            </p>
          </div>
        </div>

        {profile.bio && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bio</Label>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => window.open('/therapist/dashboard', '_blank')}
            className="flex-1 sm:flex-none"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Open Therapist Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('/therapist/earnings', '_blank')}
            className="flex-1 sm:flex-none"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            View My Earnings
          </Button>
          
          {!isApproved && (
            <Button 
              variant="outline" 
              onClick={() => window.open('/therapist/profile', '_blank')}
              className="flex-1 sm:flex-none"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}