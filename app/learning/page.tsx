"use client";
import React, { useEffect } from "react";

const Page = () => {
  const token =
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJfdWxIVzFFQ09oYkQ2UjVVamFabjZabmUyS21kbklOb1pjTXNHNWlGVS1JIn0.eyJleHAiOjE3NjM3NDA3NDcsImlhdCI6MTc2MzcwNDc0NywianRpIjoiYTNhMzI5NDktM2ViNC00ODEyLTg2ZmItNjFjZDczYWI0MjBmIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay5icnZ0ZWNrLmNvbS9yZWFsbXMvcGVyc2Z0LWRldiIsInN1YiI6IjBmYjc5ZjlkLWYwYWMtNDllMC1hYTAyLTk2NDNkZjUyMzU2NiIsInR5cCI6IkJlYXJlciIsImF6cCI6InBlcnNmdC1kZXYiLCJzaWQiOiI3MjhhYzZjMS00Y2IyLTQwMDAtYWYwZS0yZTQyMTVjMjE4YWMiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJhZG1pbiJdfSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiYWRtaW4gdXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIiwiZ2l2ZW5fbmFtZSI6ImFkbWluIiwiZmFtaWx5X25hbWUiOiJ1c2VyIiwiZW1haWwiOiJhZG1pbkBrb2x2YWwuY29tIn0.SzraAFZCgiicq-xgtju1d_UxoUfV3qJLY6Keh8uksdtqChnJ6m4IJ4k8gEdMi2TE3OUwHkPa9n8JhsE-QV5rA4M-g0hrJGzI635HWS7iI9VfPJZYpmGWfacNvO6Dsw2YyiHc6PD6OWTQmfEEUOPF3eLO04ldarVJW9rLXZqZ2_iAqharHVGeAjjJSLf6u1uSlv6blNxEGzVwAS5K_Al6v5j9GGnQ80uAHiPhAuXIFRRy09p4aD1hLXJC-32lDN07mMaoLWDpmmy5-kVcf4jzdje6745xlUY8sQ6eJQ6ujOImz8JCJu0mR_Swwd8h7TesBoo7ucg9f4V85McyBk2-6g";
  const fetchResidences = async () => {
    try {
      const res = await fetch(
        "https://devapi.admin.persft.brvteck.com/api/v1/residence-types",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch residences: ${res.status} ${res.statusText}`
        );
      }
      const r = await res;
      console.log("Response status:", r);
      const residences = await res.json();
      console.log(residences);
    } catch (error) {
      console.error("Error fetching residences:", error);
    }
  };

  useEffect(() => {
    fetchResidences();
  }, [token]);

  return (
    <div className="flex items-center flex-col min-h-screen">
      <h1 className="text-4xl mb-4">Learning API integration</h1>
      <p>Welcome to the learning section of our application.</p>
    </div>
  );
};

export default Page;
