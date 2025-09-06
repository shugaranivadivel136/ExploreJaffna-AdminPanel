"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description
const ToastClose = ToastPrimitives.Close

export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
