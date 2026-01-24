"use client";

import FileDropzone from "@/components/shared/file-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

export default function SupportForm() {
  const t = useTranslations("HelpCenter.Support")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filesUploading, setFilesUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("errors.nameMin"),
    }),
    email: z.string().email({
      message: t("errors.invalidEmail"),
    }),
    urgency: z.enum(["low", "medium", "high"], {
      required_error: t("errors.urgencyRequired"),
    }),
    issueType: z.string({
      required_error: t("errors.issueTypeRequired"),
    }),
    subject: z.string().min(5, {
      message: t("errors.subjectMin"),
    }),
    message: z.string().min(10, {
      message: t("errors.messageMin"),
    }),
    attachments: z.array(z.string().url()).optional(),
    terms: z.boolean().refine((val) => val === true, {
      message: t("errors.termsRequired"),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      urgency: "medium",
      issueType: "",
      subject: "",
      message: "",
      terms: false,
    },
  });

  // Form submission handler
  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Validation failed");
      }

      toast.success(t("toast.successTitle"), {
        description: t("toast.successDescription"),
      });

      setSubmitStatus("success");
      form.reset({
        issueType: values.issueType
      });
    } catch (error) {
      console.error("Submission error:", error);

      toast.error(t("toast.errorTitle"), {
        description: t("toast.errorDescription"),
      });

      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <div className=" mx-auto px-6 scroll-mt-32 pb-10 pt-10 w-full max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("intro")}
        </p>
      </div>

      {submitStatus === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200 mb-6">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">
            {t("alerts.successTitle")}
          </AlertTitle>
          <AlertDescription className="text-green-700">
            {t("alerts.successMessage")}
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {t("alerts.errorTitle")}
          </AlertTitle>
          <AlertDescription>
            {t("alerts.errorMessage")}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.name")}
                      className="!h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.email")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.email")}
                      className="!h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  {t("fields.urgency")}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="low" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t("placeholders.urgency.low")}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="medium" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t("placeholders.urgency.medium")}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="high" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t("placeholders.urgency.high")}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  {t("fields.issueType")}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full !h-10">
                      <SelectValue placeholder={t("placeholders.issueType.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="technical">
                      {t("placeholders.issueType.technical")}
                    </SelectItem>
                    <SelectItem value="billing">
                      {t("placeholders.issueType.billing")}
                    </SelectItem>
                    <SelectItem value="account">
                      {t("placeholders.issueType.account")}
                    </SelectItem>
                    <SelectItem value="feature">
                      {t("placeholders.issueType.feature")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("placeholders.issueType.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.subject")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("placeholders.subject")}
                    {...field}
                    className="!h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.message")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("placeholders.message")}
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("descriptions.message")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.attachments")}</FormLabel>
                <FormControl>
                  <FileDropzone
                    fileUploadDone={(urls) => {
                      field.onChange([...(field.value || []), ...urls]);
                    }}
                    onUploadingChange={setFilesUploading}
                  />

                </FormControl>
                <FormDescription>
                  {t("descriptions.attachments")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />



          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start space-x-3 space-y-0 rounded-md border p-4">
                <div className="flex flex-row items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("fields.terms")}
                    </FormLabel>
                    <FormDescription>
                      {t("descriptions.terms")}
                    </FormDescription>
                  </div>
                </div>
                <FormMessage className="mt-2" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || filesUploading}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {t("buttons.submitting")}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t("buttons.submit")}
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
