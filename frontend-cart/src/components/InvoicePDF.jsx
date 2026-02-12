import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create premium monochrome styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#18181b', // Zinc-950
        backgroundColor: '#FFFFFF'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        borderBottom: '1.5pt solid #e4e4e7', // Zinc-200
        paddingBottom: 20
    },
    logoContainer: {
        width: 120
    },
    logo: {
        width: 100,
        height: 40,
        objectFit: 'contain'
    },
    logoPlaceholder: {
        fontSize: 24,
        fontWeight: 'extrabold',
        letterSpacing: -1,
        color: '#000000'
    },
    logoPlaceholderPlus: {
        color: '#a1a1aa' // Zinc-400
    },
    headerRight: {
        textAlign: 'right'
    },
    documentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8
    },
    metaGrid: {
        flexDirection: 'column',
        gap: 2
    },
    metaItem: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8
    },
    metaLabel: {
        color: '#71717a', // Zinc-500
        fontSize: 8,
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    metaValue: {
        fontWeight: 'bold',
        width: 80,
        textAlign: 'right'
    },
    addressSection: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 40
    },
    addressBox: {
        flex: 1
    },
    addressLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#a1a1aa', // Zinc-400
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        borderBottom: '0.5pt solid #f4f4f5', // Zinc-100
        paddingBottom: 4
    },
    addressContent: {
        fontSize: 10,
        lineHeight: 1.5,
        fontWeight: 'medium'
    },
    table: {
        marginTop: 10
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#18181b', // Zinc-950
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4
    },
    tableHeaderCell: {
        color: '#FFFFFF',
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid #f4f4f5', // Zinc-100
        paddingVertical: 12,
        paddingHorizontal: 12,
        alignItems: 'flex-start'
    },
    colDesc: { width: '45%' },
    colSpecs: { width: '40%' },
    colQty: { width: '15%', textAlign: 'right' },

    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    itemSub: {
        fontSize: 8,
        color: '#71717a', // Zinc-500
        lineHeight: 1.4
    },
    specsGrid: {
        paddingLeft: 10,
        borderLeft: '1pt solid #f4f4f5'
    },
    specRow: {
        flexDirection: 'row',
        marginBottom: 2
    },
    specKey: {
        width: 60,
        fontSize: 7,
        color: '#a1a1aa',
        textTransform: 'uppercase'
    },
    specVal: {
        fontSize: 7,
        fontWeight: 'bold',
        flex: 1
    },
    qtyValue: {
        fontSize: 11,
        fontWeight: 'bold'
    },
    notesSection: {
        marginTop: 40,
        padding: 15,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        border: '0.5pt solid #e4e4e7'
    },
    notesTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#71717a',
        marginBottom: 8
    },
    notesContent: {
        fontSize: 9,
        lineHeight: 1.6,
        color: '#3f3f46'
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTop: '0.5pt solid #f4f4f5',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    footerText: {
        fontSize: 7,
        color: '#a1a1aa',
        textTransform: 'uppercase'
    },
    pageNumber: {
        fontSize: 7,
        color: '#a1a1aa'
    }
});

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const InvoicePDF = ({ invoiceData, customSettings }) => {
    const { title, logoUrl, senderAddress, recipientAddress, invoiceNumber, date, notes } = customSettings;
    const items = invoiceData.items || [];

    return (
        <Document author="Forplus Procurement System" title={title || "Request for Quotation"}>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {logoUrl ? (
                            <Image style={styles.logo} src={logoUrl} />
                        ) : (
                            <Text style={styles.logoPlaceholder}>
                                FOR<Text style={styles.logoPlaceholderPlus}>PLUS</Text>
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.documentTitle}>{title || "REQUEST FOR QUOTATION"}</Text>
                        <View style={styles.metaGrid}>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Reference:</Text>
                                <Text style={styles.metaValue}>{invoiceNumber}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Date Issued:</Text>
                                <Text style={styles.metaValue}>{formatDate(date)}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Valid Until:</Text>
                                <Text style={styles.metaValue}>{formatDate(new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString())}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Address Section */}
                <View style={styles.addressSection}>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressLabel}>Originator</Text>
                        <Text style={styles.addressContent}>{senderAddress}</Text>
                    </View>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressLabel}>Recipient / Supplier</Text>
                        <Text style={styles.addressContent}>{recipientAddress}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colDesc}><Text style={styles.tableHeaderCell}>Item / Product Specifications</Text></View>
                        <View style={styles.colSpecs}><Text style={styles.tableHeaderCell}>Technical Parameters</Text></View>
                        <View style={styles.colQty}><Text style={styles.tableHeaderCell}>Quantity</Text></View>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow} wrap={false}>
                            <View style={styles.colDesc}>
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemSub}>{item.description ? item.description.slice(0, 180) + (item.description.length > 180 ? '...' : '') : 'Detailed description available in digital archives.'}</Text>
                            </View>
                            <View style={styles.colSpecs}>
                                {(() => {
                                    let specs = item.specifications;
                                    if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch { } }
                                    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                                        const entries = Object.entries(specs).slice(0, 6);
                                        if (entries.length === 0) return <Text style={{ fontSize: 7, color: '#a1a1aa', fontStyle: 'italic' }}>Standard requirements apply.</Text>;
                                        return (
                                            <View style={styles.specsGrid}>
                                                {entries.map(([k, v]) => (
                                                    <View key={k} style={styles.specRow}>
                                                        <Text style={styles.specKey}>{k.replace(/_/g, ' ')}</Text>
                                                        <Text style={styles.specVal}>{String(v)}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        );
                                    }
                                    return <Text style={{ fontSize: 7, color: '#a1a1aa', fontStyle: 'italic' }}>Standard requirements apply.</Text>;
                                })()}
                            </View>
                            <View style={styles.colQty}>
                                <Text style={styles.qtyValue}>{item.quantity || 1}</Text>
                                <Text style={{ fontSize: 6, color: '#a1a1aa', textTransform: 'uppercase' }}>Units</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quotation Protocol / Notes */}
                <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Procurement Protocol & Notes</Text>
                    <Text style={styles.notesContent}>{notes}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Certified forplus Procurement Document // Automated generation</Text>
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `PAGE ${pageNumber} OF ${totalPages}`} fixed />
                </View>
            </Page>
        </Document>
    );
};
