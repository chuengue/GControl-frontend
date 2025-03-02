import html2canvas from 'html2canvas';

export const handleTableDownload = async (tableRef: React.RefObject<HTMLTableElement>) => {
  if (!tableRef.current) return;

  try {
    // Create a container for the table
    const container = document.createElement('div');
    container.style.padding = '40px';
    container.style.backgroundColor = '#121212';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = 'max-content'; // Allow container to grow with content
    document.body.appendChild(container);

    // Create a new table with all data
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = 'max-content';
    table.style.backgroundColor = 'transparent';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Character column header
    const charHeader = document.createElement('th');
    charHeader.textContent = 'Personagem';
    charHeader.style.padding = '12px 20px';
    charHeader.style.backgroundColor = '#1a1a1a';
    charHeader.style.color = '#fff';
    charHeader.style.borderBottom = '2px solid rgba(144, 202, 249, 0.3)';
    headerRow.appendChild(charHeader);

    // Mission headers
    const missionCells = Array.from(tableRef.current.querySelectorAll('thead th')).slice(1);
    missionCells.forEach(cell => {
      const th = document.createElement('th');
      th.style.padding = '12px 20px';
      th.style.backgroundColor = '#1a1a1a';
      th.style.color = '#fff';
      th.style.borderBottom = '2px solid rgba(144, 202, 249, 0.3)';
      th.style.minWidth = '90px';
      th.style.textAlign = 'center';
      th.textContent = cell.textContent || '';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    const rows = Array.from(tableRef.current.querySelectorAll('tbody tr'));

    rows.forEach(originalRow => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';

      // Character cell
      const charCell = document.createElement('td');
      charCell.style.padding = '12px 20px';
      charCell.style.backgroundColor = '#1a1a1a';
      charCell.style.color = '#fff';
      charCell.style.whiteSpace = 'nowrap';
      charCell.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';

      const originalCharInfo = originalRow.querySelector('td:first-child');
      if (originalCharInfo) {
        const charName = document.createElement('div');
        charName.style.fontWeight = '600';
        charName.style.marginBottom = '4px';
        // Fix: Get the character name from the Typography component
        const nameElement = originalCharInfo.querySelector('.MuiTypography-subtitle2');
        charName.textContent = nameElement?.textContent || '';

        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100px';
        progressContainer.style.height = '4px';
        progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        progressContainer.style.borderRadius = '2px';
        progressContainer.style.overflow = 'hidden';

        const progress = document.createElement('div');
        const progressElement = originalCharInfo.querySelector('.MuiLinearProgress-root');
        const progressValue = progressElement
          ? Number(progressElement.getAttribute('aria-valuenow')) || 0
          : 0;

        progress.style.width = `${progressValue}%`;
        progress.style.height = '100%';
        progress.style.backgroundColor = '#4caf50';
        progress.style.borderRadius = '2px';

        progressContainer.appendChild(progress);
        charCell.appendChild(charName);
        charCell.appendChild(progressContainer);
      }

      row.appendChild(charCell);

      // Mission cells
      const missionCells = Array.from(originalRow.querySelectorAll('td')).slice(1);
      missionCells.forEach(originalCell => {
        const cell = document.createElement('td');
        cell.style.padding = '12px 20px';
        cell.style.backgroundColor = '#1a1a1a';
        cell.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';
        cell.style.textAlign = 'center';

        const checkboxes = originalCell.querySelectorAll('input[type="checkbox"]');
        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.gap = '4px';
        checkboxContainer.style.justifyContent = 'center';

        checkboxes.forEach(checkbox => {
          const isChecked = (checkbox as HTMLInputElement).checked;
          const checkboxDiv = document.createElement('div');
          checkboxDiv.style.width = '16px';
          checkboxDiv.style.height = '16px';
          checkboxDiv.style.borderRadius = '4px';
          checkboxDiv.style.border = isChecked ? 'none' : '1px solid rgba(255, 255, 255, 0.3)';
          checkboxDiv.style.backgroundColor = isChecked ? '#4caf50' : 'transparent';

          if (isChecked) {
            checkboxDiv.innerHTML = '✓';
            checkboxDiv.style.color = '#fff';
            checkboxDiv.style.display = 'flex';
            checkboxDiv.style.alignItems = 'center';
            checkboxDiv.style.justifyContent = 'center';
            checkboxDiv.style.fontSize = '12px';
          }

          checkboxContainer.appendChild(checkboxDiv);
        });

        cell.appendChild(checkboxContainer);
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

    // Add watermark
    const watermark = document.createElement('div');
    watermark.style.position = 'absolute';
    watermark.style.top = '50%';
    watermark.style.left = '50%';
    watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
    watermark.style.fontSize = '64px';
    watermark.style.fontWeight = 'bold';
    watermark.style.color = 'rgba(255, 255, 255, 0.1)';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '1000';
    watermark.style.whiteSpace = 'nowrap';
    watermark.textContent = 'Chase Tracker';
    container.appendChild(watermark);

    // Capture the table
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#121212',
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
      onclone: (clonedDoc, element) => {
        element.style.width = 'max-content';
        element.style.height = 'max-content';
      }
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `chase-tracker-table-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Cleanup
    document.body.removeChild(container);
  } catch (error) {
    console.error('Error generating image:', error);
  }
};
