# CampusBuddy – An AI-Powered Campus Management System
[![GitHub Repo](https://img.shields.io/badge/GitHub-CampusBuddy-blue?logo=github)](https://github.com/siddharthvarpe086/college-student-buddy)

link: https://campus-buddy-student-helpdesk.vercel.app/
## Overview

CampusBuddy is an AI-powered campus assistance platform built to bridge the gap between faculty and students. It allows faculty members to securely upload and manage official college data while providing students with an intelligent chatbot that only answers questions strictly based on the verified college database.
This ensures **reliable, college-specific, and non-random responses**, helping freshers and regular students quickly find details about faculty, events, timetables, and campus resources.

## Problem Statement: 
**Students are too shy to ask questions**. They worry their question is "stupid" or that they're interrupting the faculty, so they stay quiet and remain confused.
At the same time, **teachers get tired of repeating the same answers**. They spend valuable time answering FAQs over and over, when they could be focusing on actual teaching.
This creates a frustrating loop where students don't get the instant help they need, and teachers waste precious time.

## Proposed Solution:
**CampusBuddy**, an AI assistant that acts as a friendly and smart guide for every student.
1. **For Students: Ask Anything, Anonymously.** Students can ask CampusBuddy any question, anytime, from their phone or computer. No more worrying about a "silly question" – they get instant, reliable answers right when they need them.
2. **For Teachers: Answer Once, and You're Done**. Teachers get a portal where they build the AI's "brain" by adding answers to common questions and uploading college related documents. They only have to answer a question **once**. From then on, CampusBuddy handles it for every student, freeing up the teacher to focus on actual teaching.
**Peer-to-peer connect (SyncSpot)**: If a student asks a new question the AI doesn't know, it directs that question to the **“SyncSpot”** without revealing his identity. Questions will be displayed to everyone, one who knows the answer can reply, and the AI instantly learns that new answer, ready for the next student who asks.
It’s a simple system where **students get help without fear, and teachers get their time back.**


## Key Features
### Faculty Portal
**Secure Login:** Faculty members can access the portal only with verified credentials (ID & password).


**Data Entry System:**


-**Title** – Add a descriptive heading for the entry.

-**Category** – Select the relevant category (events, timetable, faculty, etc.).

-**Content** – Enter the main information.

-**Tags (Optional)** – Add searchable tags for quick lookup.

-**Document** - can upload college related documents like timetables, notices and circulars.

-**Database Integration:** All added data is stored in the database and displayed in the “Existing College Data” section.

-**AI access to database:** Faculty can give access of the database to AI with updated data at the click of a button, making information instantly available to students.


### Student Side (CampusBuddy)


-**Signup/Signin** with Supabase Authentication (email confirmation required).

-**Smart Query System:** Students can ask campus-related questions and get instant, verified responses.

-**Peer-to-Peer connect:** If the answer of the question is not present in the college database, AI will divert it to “SyncSpot”. Other students can answer the question.

-**Relevant Answering:**


**If information exists** → AI answers directly from the college database.
**If missing** → AI won’t give random answers; instead, → AI will divert the question to the **“SyncSpot”**.


**Content Coverage:** Access details about campus facilities, faculty members, ongoing events, class schedules, and other college-specific data.


## Tech Stack
1) Vite
2) TypeScript
3) React
4) shadcn-ui
5) Tailwind CSS
6) Database: Supabase (for authentication + data storage)
7) AI Integration: Access of AI model on faculty-provided data
8) Authentication: Supabase Auth (email-based confirmation)


## Demo Credentials: 

**Faculty login:**
| ID           |    Password  |
| ---------------- | ---------------|
| Neuron     |  Neuron | 

**Student login:**

| ID           |    Password   |
| ---------------- | ---------------|
| demo.credentials0@gmail.com     |  123456789@admin | 

## Demo Data to feed:

**Demo Faculty Data**
1. **Event Entry**
**Title**: Freshers’ Orientation Program 2025

**Category**: Events

**Content**: The Freshers’ Orientation Program will be held on 3rd October 2025 at the Main Auditorium, 10:00 AM onwards. All first-year students must attend. The program includes an introduction to college facilities, faculty interaction, and cultural activities.

**Tags**: orientation, fresher, event



2. **Timetable Entry**
**Title**: Computer Science 2nd Year Timetable

**Category**: Timetable

**Content**: The CS 2nd Year classes will run from Monday to Friday, 9:00 AM – 4:00 PM. Labs are scheduled on Wednesday and Friday (2:00 PM – 4:00 PM) in Lab-3.

**Tags**: cs, timetable, lab



3. **Faculty Entry**
**Title**: Dr. Anjali Mehta – Head of Department (Computer Science)

**Category**: Faculty

**Content**: Dr. Anjali Mehta is the HOD of the Computer Science Department. She specializes in Artificial Intelligence and Machine Learning. Office hours: Monday to Wednesday, 11:00 AM – 1:00 PM in Room No. 210.

**Tags**: faculty, hod, ai, machine learning


## Demo Student Questions
-“When is the Freshers’ Orientation Program happening?”

-“Can you give me the CS 2nd Year timetable?”

-“Who is the HOD of Computer Science and what are her office hours?”

-“What are the timings of the Central Library?”


## Workflow
**Faculty Workflow**

Faculty logs into the portal using secure credentials.

Adds new campus-related data (title, category, content, tags and documents).

Data gets stored in the database and visible in “Existing College Data”.

Faculty clicks “**Train AI Model**” → New data is fed to the AI model.


**Student Workflow:**

Student clicks **Get Started** → signs up with Supabase Auth.

Confirms email and logs into CampusBuddy.

Asks queries related to the college.

AI answers only using the verified database.

If data exists → Direct answer.

If data doesn’t exist → Question diverted to “SyncSpot”
Questions diverted to the “SyncSpot” will be visible to all students, and can answer that question if they know.

## Problem Statement Solved:
Freshers and students often face difficulty in:

~Knowing about faculty and their expertise.

~Staying updated with ongoing events.

~Accessing timetable and campus resources.

~No need to feel shy, hesitated and afraid.

~No need to wait longer to get your queries resolved.


CampusBuddy solves this by providing **one trusted AI-driven platform**, ensuring **accuracy, reliability, and ease of access.**

## Unique Selling Points
**Closed Knowledge System:** AI answers only from verified database (no random answers).

**Faculty-Verified Content:** Ensures authenticity of information.

**Realtime AI Training:** Faculty can update knowledge base anytime.

**Student-Friendly:** Designed especially for freshers to navigate campus life.


## Future Scope
1) **Multilingual Support:** Queries in regional languages.

2) **Mobile App Integration** (Android/iOS).

3) **Voice-based Query System**.

4) **Event Reminder & Notifications for students**.

5) **Analytics Dashboard** for faculty (track most-asked questions).


## Installation & Setup
## Clone the repository
```bash
git clone https://github.com/your-username/campusbuddy.git
cd campusbuddy
```

## Install dependencies
```bash
npm install
```

## Setup environment variables (Supabase keys, AI model API keys, etc.)
```bash
cp .env.example .env
```

## Run development server
```bash
npm run dev
```

## Team Neuron

-Siddharth Varpe

-Nisha Lende

-Pratiksha Gavhale

-Samyak Mehta

-Kartik Vaidy

-Aniket Chitre



 ## Acknowledgment
We would like to express our sincere gratitude to our mentors, faculty members, and organizers of the Hackathon for giving us this valuable opportunity to work on a real-world problem statement. Their constant guidance and encouragement motivated us to think critically and build a practical solution.
We also thank our faculty advisors for providing insightful feedback during the development process, which helped us refine our project. Special thanks to the hackathon organizing team for creating an engaging platform to showcase innovation and teamwork.

Finally, we would like to acknowledge the collaborative effort of our team members. Each individual’s contribution in ideation, development, AI integration, and documentation made **CampusBuddy** a reality.
