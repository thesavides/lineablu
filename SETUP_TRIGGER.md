# Set Up Cloud Build Trigger

Since the gcloud CLI is having issues creating the trigger, here's how to set it up through the Google Cloud Console:

## Steps:

1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=little-bo-peep-483820

2. Click "CREATE TRIGGER"

3. Configure the trigger:
   - **Name**: `lineablu-auto-deploy`
   - **Description**: `Auto-deploy LineaBlu app on push to main`
   - **Event**: Push to a branch
   - **Source**:
     - **Repository**: `thesavides/lineablu` (should already be connected)
     - **Branch**: `^main$`
   - **Configuration**:
     - **Type**: Cloud Build configuration file
     - **Location**: `cloudbuild.yaml`
   - **Advanced** (expand this section):
     - Leave other settings as default

4. Click "CREATE"

## After Creating the Trigger:

To test the deployment, commit and push your changes:

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
git add .
git commit -m "Configure deployment with Node 20 and Supabase secrets"
git push origin main
```

This will automatically trigger a build and deployment to Cloud Run.

## Monitor the Build:

Watch the build progress at:
https://console.cloud.google.com/cloud-build/builds?project=little-bo-peep-483820

## View the Deployed Service:

Once deployed, view your service at:
https://console.cloud.google.com/run?project=little-bo-peep-483820

The service will be named: `lineablu-legal-impact-score`
