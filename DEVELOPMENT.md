# DEVELOPMENT.md

This document outlines the development environment setup and common practices for working on this monorepo.

## Colima Setup for Docker Volume Permissions (macOS/Linux)

If you are using Colima as your Docker runtime on macOS or Linux and encounter `permission denied` errors when mounting host volumes into Docker containers, it is likely due to a User ID (UID) or Group ID (GID) mismatch between your host machine, the Colima virtual machine, and the Docker container.

To resolve this, you need to explicitly mount your project's root directory into the Colima VM with write permissions. This ensures that the file system permissions are correctly handled.

**Steps to configure Colima:**

1. **Stop and Delete Existing Colima Instance (if running):**
    This ensures that any previous configurations are cleared and the new mount settings can take effect.

    ```bash
    colima stop
    colima delete
    ```

2. **Start Colima with Project Root Mounted:**
    Start a new Colima instance, explicitly mounting your monorepo's root directory (e.g., `$(pwd)` or `~/path/to/your/project`) with write permissions (`:w`).

    ```bash
    colima start --mount $(pwd):w
    ```

    This command mounts your entire project directory into the Colima VM, allowing Docker containers running within Colima to access and write to files in this directory without permission issues.

    **Note:** If your home directory is not already mounted by default or you encounter issues with other paths, you might need to mount your home directory as well:

    ```bash
    colima start --mount $HOME:w --mount $(pwd):w
    ```

After performing these steps, you should be able to run Docker containers with host volume mounts without encountering `permission denied` errors.
