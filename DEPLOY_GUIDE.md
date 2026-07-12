# GitHub Pages Deployment Guide

This guide explains how to deploy your newly created portfolio website to GitHub Pages (`github.io`) using the GitHub Web Interface (no Git commands or terminal required!).

---

## Method 1: Host at `yourusername.github.io` (Recommended)

This method hosts your portfolio at the root of your GitHub pages domain (e.g., `https://faizeensaba.github.io`).

### Step 1: Create the Repository on GitHub
1. Open your web browser and go to [GitHub](https://github.com) (log in or create a free account).
2. Click the **`+`** icon in the top right corner and select **New repository**.
3. Name your repository exactly: `yourusername.github.io` 
   *(Replace `yourusername` with your actual GitHub username in lowercase. For example, if your username is `faizeensaba`, name the repository `faizeensaba.github.io`)*.
4. Ensure the repository visibility is set to **Public** (GitHub Pages requires public repositories for free accounts).
5. Leave the options to add a README, .gitignore, and license unchecked.
6. Click the green **Create repository** button.

### Step 2: Upload Your Portfolio Files
1. On the setup page that appears, look for the text: *"Get started by creating a new file or uploading an existing file."*
2. Click the **uploading an existing file** link.
3. Open your file explorer, navigate to `c:\Users\faize\Desktop\porfolio_project`, select the following files, and drag-and-drop them into the box on the GitHub page:
   - `index.html`
   - `index.css`
   - `index.js`
   - `portfolio-data.json`
   - `profile.jpg`
   - `resume.pdf`
4. Once all files finish uploading, scroll down to the **Commit changes** box.
5. (Optional) Enter a brief description like `Initial portfolio upload`.
6. Select **Commit directly to the main branch** and click **Commit changes**.

### Step 3: View Your Live Portfolio
1. GitHub will take about 1 to 2 minutes to build and publish your site.
2. Open a new tab in your web browser and navigate to: `https://yourusername.github.io` (substituting your actual username).
3. If it doesn't appear immediately, wait 30 seconds and refresh the page.

---

## Method 2: Host as a Sub-project (e.g., `yourusername.github.io/portfolio`)

Use this method if you want to name your repository something else (e.g., `portfolio`).

1. Create a repository on GitHub named `portfolio` (ensure it is **Public**).
2. Click **uploading an existing file** and upload the portfolio files listed above, then click **Commit changes**.
3. Go to the **Settings** tab of your repository on GitHub.
4. In the left sidebar, click on **Pages** (under the "Code and automation" section).
5. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: Select **`main`** (or `master`) and folder **`/ (root)`**
   - Click the **Save** button.
6. Scroll to the top of the Pages screen. In a couple of minutes, a notification banner will display: *"Your site is live at: https://yourusername.github.io/portfolio/"*.

---

## How to Update Your Portfolio Content in the Future

One of the best features of this portfolio is the **interactive Admin Dashboard** (Edit Mode):
1. Run the local server by double-clicking `local-server.py` (or running `python local-server.py` in PowerShell).
2. Click the **Edit Mode** button on the top right.
3. Edit your profile, add new projects, update skills, etc.
4. Click the **Export portfolio-data.json** button at the top of the Admin Panel to download your updated `portfolio-data.json` file.
5. Go to your repository on GitHub, click on **`portfolio-data.json`**, click the pencil icon in the top right to edit, copy-paste the new JSON content into it (or click **Add file** -> **Upload files** to overwrite it), and click **Commit changes**.
6. Your live website will automatically update in a minute!
