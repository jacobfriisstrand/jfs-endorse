import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./ContactSectionForm.module.css";

const endorseKey = "f252801b-27b3-4f54-a643-5e4604dba202";

const SignUpSchema = z.object({
  from_name: z.string().min(1, { message: "Navn skal mindst være 1 tegn" }).max(20, { message: "Navn kan ikke være længere end 20 tegn" }),
  email: z.string().email({ message: "Email er ugyldig" }),
  phone: z.string().min(3, { message: "Telefon skal mindst være 3 tegn" }).max(20, { message: "Telefon kan ikke være længere end 20 tegn" }),
  subject: z.string().min(1, { message: "Emne skal mindst være 1 tegn" }),
  message: z.string().min(1, { message: "Besked skal mindst være 1 tegn" }),
});
type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export default function ContactSectionForm({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },

    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSubmitSuccessful]);

  const onSubmit: SubmitHandler<SignUpSchemaType> = async (data, e) => {
    const formData = { ...data, access_key: endorseKey };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData, null, 2),
      });

      const json = await response.json();
      if (json.success) {
        setIsSuccess(true);
        e?.target.reset();
        reset();
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      setIsSuccess(false);
      console.log(error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div>
          <div className={styles.label__group}>
            <label htmlFor="name">Navn</label>
            {errors.from_name && <span className={errors.from_name ? `${styles.input__error}` : ""}>{errors.from_name.message}</span>}
          </div>
          <input type="text" id="name" {...register("from_name")} />
        </div>
        <div>
          <div className={styles.label__group}>
            <label htmlFor="email">Email</label>
            {errors.email && <span className={errors.email ? `${styles.input__error}` : ""}>{errors.email.message}</span>}
          </div>
          <input type="text" id="email" {...register("email")} />
        </div>
        <div>
          <div className={styles.label__group}>
            <label htmlFor="phone">Telefon</label>
            {errors.phone && <span className={errors.phone ? `${styles.input__error}` : ""}>{errors.phone.message}</span>}
          </div>
          <input type="text" id="phone" {...register("phone")} />
        </div>
        <div>
          <div className={styles.label__group}>
            <label htmlFor="subject">Emne</label>
            {errors.subject && <span className={errors.subject ? `${styles.input__error}` : ""}>{errors.subject.message}</span>}
          </div>
          <input type="text" id="subject" {...register("subject")} />
        </div>
        <div>
          <div className={styles.label__group}>
            <label htmlFor="message">Besked</label>
            {errors.message && <span className={errors.message ? `${styles.input__error}` : ""}>{errors.message.message}</span>}
          </div>
          <textarea rows={7} id="message" {...register("message")} />
        </div>
        {children}
      </form>

      {showToast && <div className={`${styles.toast} ${styles.fadeOut}`}>{isSuccess ? <h3>Din besked er blevet indsendt. Mange tak.</h3> : <h3>Der opstod en fejl. Prøv igen</h3>}</div>}
    </>
  );
}
