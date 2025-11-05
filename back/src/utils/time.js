// function clip(n) { return n < 0 ? 0 : n; }

// function splitYMDHMin(fromDate, toDate) {
//     // Descompone en años/meses/días/horas/minutos “calendáricos”
//     let from = new Date(fromDate);
//     const to = new Date(toDate);

//     let years = to.getFullYear() - from.getFullYear();
//     // Corrige año si el mes/día aún no ha pasado
//     {
//         const test = new Date(from);
//         test.setFullYear(from.getFullYear() + years);
//         if (test > to) years--;
//     }
//     from.setFullYear(from.getFullYear() + years);

//     let months = to.getMonth() - from.getMonth();
//     if (months < 0) months += 12;
//     {
//         const test = new Date(from);
//         test.setMonth(from.getMonth() + months);
//         if (test > to) months--;
//     }
//     from.setMonth(from.getMonth() + months);

//     // ahora diferencia restante en ms
//     let diffMs = to - from;
//     const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
//     diffMs -= days * 24 * 60 * 60 * 1000;

//     const hours = Math.floor(diffMs / (60 * 60 * 1000));
//     diffMs -= hours * 60 * 60 * 1000;

//     const minutes = Math.floor(diffMs / (60 * 1000));

//     return {
//         years: clip(years),
//         months: clip(months),
//         days: clip(days),
//         hours: clip(hours),
//         minutes: clip(minutes),
//     };
// }

// function humanizeDuration(from, to) {
//     const { years, months, days, hours, minutes } = splitYMDHMin(from, to);
//     const parts = [];
//     if (years) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
//     if (months) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
//     if (days) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
//     if (hours) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
//     if (minutes || parts.length === 0)
//         parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
//     return parts.join(', ');
// }

// // Para mostrar el total acumulado si guardas ms totales
// function humanizeMs(ms) {
//     const to = new Date(0 + ms);
//     const from = new Date(0);
//     return humanizeDuration(from, to);
// }

function clip(n) { return n < 0 ? 0 : n; }

function splitYMDHMin(fromDate, toDate) {
    let from = new Date(fromDate);
    const to = new Date(toDate);

    let years = to.getFullYear() - from.getFullYear();
    {
        const test = new Date(from);
        test.setFullYear(from.getFullYear() + years);
        if (test > to) years--;
    }
    from.setFullYear(from.getFullYear() + years);

    let months = to.getMonth() - from.getMonth();
    if (months < 0) months += 12;
    {
        const test = new Date(from);
        test.setMonth(from.getMonth() + months);
        if (test > to) months--;
    }
    from.setMonth(from.getMonth() + months);

    let diffMs = to - from;
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    diffMs -= days * 24 * 60 * 60 * 1000;

    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    diffMs -= hours * 60 * 60 * 1000;

    const minutes = Math.floor(diffMs / (60 * 1000));

    return { years, months, days, hours, minutes };
}

export function humanizeDuration(from, to) {
    const { years, months, days, hours, minutes } = splitYMDHMin(from, to);
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    if (days) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
    if (minutes || parts.length === 0) parts.push(`${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
    return parts.join(', ');
}

export function humanizeMs(ms) {
    const to = new Date(0 + ms);
    const from = new Date(0);
    return humanizeDuration(from, to);
}
