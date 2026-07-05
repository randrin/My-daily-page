"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SignupForm = ({
  className,
  ...props
}: React.ComponentProps<"div"> = {}) => {
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [profession, setProfession] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const professions = [
    "Software Developer",
    "Designer",
    "Product Manager",
    "Marketing",
    "Sales",
    "Teacher",
    "Doctor",
    "Engineer",
    "Student",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    // TODO: Implement signup logic
    console.log("Signup data:", {
      email,
      firstName,
      lastName,
      gender,
      profession,
      acceptTerms
    });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!");
      // Reset form
      setEmail("");
      setFirstName("");
      setLastName("");
      setGender("");
      setProfession("");
      setAcceptTerms(false);
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              {/* First Name */}
              <Field>
                <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              {/* Last Name */}
              <Field>
                <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>

              {/* Gender */}
              <Field>
                <FieldLabel htmlFor="gender">Gender *</FieldLabel>
                <Select
                  value={gender}
                  onValueChange={setGender}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Profession */}
              <Field>
                <FieldLabel htmlFor="profession">Profession *</FieldLabel>
                <Select
                  value={profession}
                  onValueChange={setProfession}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="profession" className="w-full">
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((prof) => (
                      <SelectItem
                        key={prof}
                        value={prof.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Terms and Conditions */}
              <Field>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isLoading}
                    className="mt-1 h-4 w-4 rounded border-input bg-transparent accent-primary cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                  <Label
                    htmlFor="acceptTerms"
                    className="text-sm font-normal leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the{" "}
                    <a
                      href="#"
                      className="underline-offset-4 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open terms and conditions
                      }}
                    >
                      terms and conditions
                    </a>{" "}
                    *
                  </Label>
                </div>
              </Field>

              {/* Submit Button */}
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a
                    href="/auth/signin"
                    className="underline-offset-4 hover:underline"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
