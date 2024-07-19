import React, { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { useAlertContext } from "@/contexts/AlertContext";
import { HideAlert } from "@/lib/alerts";

export const AlertCom = () => {
  const {alert, setAlert} = useAlertContext()
  useEffect(() => {
    const timeout = setTimeout(() => setAlert(HideAlert), 2000);
    return () => clearTimeout(timeout);
  }, [alert, setAlert]);

  return (
    alert.visible && (
      <Alert variant={alert.type} className="w-1/4 fixed bottom-4 right-8">
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.text}</AlertDescription>
      </Alert>
    )
  );
};
