import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'


// Export PDF fiche individuelle enseignant
export const exportTeacherPDF = (teacher, summary, hours) => {
  const doc = new jsPDF()

  // En-tête
  doc.setFontSize(18)
  doc.setTextColor(49, 130, 206)
  doc.text('Fiche Récapitulative', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text(`Enseignant : ${teacher.firstname} ${teacher.lastname}`, 14, 35)
  doc.text(`Grade : ${teacher.grade}`, 14, 43)
  doc.text(`Statut : ${teacher.status}`, 14, 51)
  doc.text(`Département : ${teacher.department?.name || '-'}`, 14, 59)

  // Ligne séparatrice
  doc.setDrawColor(49, 130, 206)
  doc.line(14, 65, 196, 65)

  // Stats
  doc.setFontSize(13)
  doc.setTextColor(49, 130, 206)
  doc.text('Récapitulatif des heures', 14, 75)

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Heures contractuelles : ${summary.contractHours}h`, 14, 85)
  doc.text(`Total heures équivalentes : ${summary.totalEquivalentHours.toFixed(2)}h`, 14, 93)
  doc.text(`Heures normales : ${summary.normalHours.toFixed(2)}h`, 14, 101)
  doc.text(`Heures complémentaires : ${summary.extraHours.toFixed(2)}h`, 14, 109)

  if (summary.totalAmount !== null) {
    doc.setFontSize(13)
    doc.setTextColor(39, 103, 73)
    doc.text(`Montant total : ${summary.totalAmount.toLocaleString('fr-FR')} FCFA`, 14, 121)
  }

  // Tableau des heures
  doc.setFontSize(13)
  doc.setTextColor(49, 130, 206)
  doc.text('Détail des heures effectuées', 14, 135)

  autoTable(doc, {
    startY: 140,
    head: [['Matière', 'Type', 'Date', 'Durée', 'Salle', 'Statut']],
    body: hours.map(h => [
      h.teacherSubject.subject.name,
      h.hourType.name,
      new Date(h.date).toLocaleDateString('fr-FR'),
      `${h.duration}h`,
      h.room,
      h.status
    ]),
    headStyles: { fillColor: [49, 130, 206] },
    alternateRowStyles: { fillColor: [237, 242, 247] }
  })

  doc.save(`fiche_${teacher.lastname}_${teacher.firstname}.pdf`)
}

// Export Excel
import ExcelJS from 'exceljs'

export const exportTeacherExcel = async (teacher, summary, hours) => {
  const wb = new ExcelJS.Workbook()

  // Feuille récapitulatif
  const ws1 = wb.addWorksheet('Récapitulatif')
  ws1.addRows([
    ['Fiche Récapitulative'],
    [],
    ['Enseignant', `${teacher.firstname} ${teacher.lastname}`],
    ['Grade', teacher.grade],
    ['Statut', teacher.status],
    ['Département', teacher.department?.name || '-'],
    [],
    ['Heures contractuelles', `${summary.contractHours}h`],
    ['Total heures équivalentes', `${summary.totalEquivalentHours.toFixed(2)}h`],
    ['Heures normales', `${summary.normalHours.toFixed(2)}h`],
    ['Heures complémentaires', `${summary.extraHours.toFixed(2)}h`],
    ['Montant total', summary.totalAmount !== null
      ? `${summary.totalAmount.toLocaleString('fr-FR')} FCFA`
      : 'Non défini']
  ])

  // Feuille détail heures
  const ws2 = wb.addWorksheet('Heures effectuées')
  ws2.addRow(['Matière', 'Type', 'Date', 'Durée', 'Salle', 'Statut'])
  hours.forEach(h => {
    ws2.addRow([
      h.teacherSubject.subject.name,
      h.hourType.name,
      new Date(h.date).toLocaleDateString('fr-FR'),
      `${h.duration}h`,
      h.room,
      h.status
    ])
  })

  // Téléchargement
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fiche_${teacher.lastname}_${teacher.firstname}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}