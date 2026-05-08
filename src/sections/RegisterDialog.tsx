import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Checkbox } from "#/components/ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

import { Card, CardContent } from "#/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";

import { createRegistration } from "#/server/register";
import { type RegistrationInput } from "#/server/validation";
import ArrowButton from "#/components/ArrowButton";

const WHATSAPP_RETURN_TRIP_LINK =
  "https://chat.whatsapp.com/Ee0nGOyOHD08zuReDrOBWz";

type SubmittedUser = {
  id: number;
  name: string;
  contact: string;
  wantsBusReturnTrip: boolean;
};

const initialFormData: RegistrationInput = {
  name: "",
  sex: "Male",
  contact: "",
  isAttending: true,
  denomination: "",
  location: "",
  referralSource: "Social Media",
  expectations: "",
  wantsBusReturnTrip: false,
};

export default function RegistrationDialog() {
  const queryClient = useQueryClient();
  const qrCodeRef = useRef<SVGSVGElement | null>(null);

  const [open, setOpen] = useState(false);

  const [submittedUser, setSubmittedUser] = useState<SubmittedUser | null>(
    null,
  );

  const [formData, setFormData] = useState<RegistrationInput>(initialFormData);

  const mutation = useMutation({
    mutationFn: (data: RegistrationInput) => createRegistration({ data }),

    onSuccess: (data) => {
      setSubmittedUser({
        id: data.id,
        name: data.name,
        contact: data.contact,
        wantsBusReturnTrip: data.wantsBusReturnTrip,
      });

      queryClient.invalidateQueries({
        queryKey: ["registrations"],
      });

      toast.success("Registration submitted successfully.");

      if (data.wantsBusReturnTrip) {
        toast.success(
          "Join the return-trip WhatsApp group using the button below.",
        );
      }
    },

    onError: (error) => {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting.",
      );
    },
  });

  const updateField = <K extends keyof RegistrationInput>(
    key: K,
    value: RegistrationInput[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClose = (state: boolean) => {
    setOpen(state);

    if (!state) {
      setSubmittedUser(null);
      setFormData(initialFormData);
      mutation.reset();
    }
  };

  const downloadQRCode = () => {
    const svg = qrCodeRef.current ?? document.getElementById("registration-qr");

    if (!svg) {
      toast.error("QR code is not ready yet.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        toast.error("Unable to download QR code.");
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");

      downloadLink.download = `${submittedUser?.name ?? "registration"}-qr.png`;
      downloadLink.href = pngFile;

      downloadLink.click();
      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Unable to download QR code.");
    };

    image.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <ArrowButton />
      </DialogTrigger>

      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {submittedUser ? "Registration Complete" : "Attendee Details"}
          </DialogTitle>
        </DialogHeader>

        {!submittedUser ? (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>

              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sex</Label>

                <Select
                  value={formData.sex}
                  onValueChange={(value: "Male" | "Female") =>
                    updateField("sex", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>

                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>

                <Input
                  id="contact"
                  type="tel"
                  placeholder="050..."
                  value={formData.contact}
                  onChange={(e) => updateField("contact", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Where are you coming from?</Label>

              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="denomination">Denomination</Label>

              <Input
                id="denomination"
                value={formData.denomination}
                onChange={(e) => updateField("denomination", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referral">How did you hear about us?</Label>
              <Select
                value={formData.referralSource}
                onValueChange={(value) => updateField("referralSource", value)}
              >
                <SelectTrigger id="referral" className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Friend/Family">
                    Friend or Family
                  </SelectItem>
                  <SelectItem value="Church Announcement">
                    Church Announcement
                  </SelectItem>
                  <SelectItem value="Billboard/Poster">
                    Billboard or Poster
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expectations">Expectations</Label>

              <Textarea
                id="expectations"
                value={formData.expectations}
                onChange={(e) => updateField("expectations", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox
                id="bus"
                checked={formData.wantsBusReturnTrip}
                onCheckedChange={(checked) =>
                  updateField("wantsBusReturnTrip", checked === true)
                }
              />

              <Label htmlFor="bus" className="cursor-pointer">
                I want a bus return trip
              </Label>
            </div>

            <Button
              className="w-full"
              disabled={
                mutation.isPending ||
                !formData.name.trim() ||
                !formData.contact.trim()
              }
              onClick={() => mutation.mutate(formData)}
            >
              {mutation.isPending ? "Processing..." : "Submit Registration"}
            </Button>
          </div>
        ) : (
          <Card className="border-none shadow-none">
            <CardContent className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <QRCodeSVG
                  ref={qrCodeRef}
                  id="registration-qr"
                  size={200}
                  value={JSON.stringify({
                    id: submittedUser.id,
                    name: submittedUser.name,
                    contact: submittedUser.contact,
                  })}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold">{submittedUser.name}</h3>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <span className="font-medium text-foreground">
                      Contact:
                    </span>{" "}
                    {submittedUser.contact}
                  </p>
                </div>

                <p className="text-muted-foreground text-sm">
                  Please save this QR code for check-in at the event.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={downloadQRCode}
              >
                Download QR Code
              </Button>

              {submittedUser.wantsBusReturnTrip ? (
                <Button asChild className="w-full">
                  <a
                    href={WHATSAPP_RETURN_TRIP_LINK}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join WhatsApp Return Trip Group
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
