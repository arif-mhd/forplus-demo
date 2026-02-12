"use client";
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Premium Professional Styles
const styles = StyleSheet.create({
    page: {
        padding: 0,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#1a1a1a',
        backgroundColor: '#FFFFFF'
    },
    // Premium Header Band
    headerBand: {
        backgroundColor: '#18181b', // Zinc-900
        paddingHorizontal: 40,
        paddingVertical: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 4,
        borderBottomColor: '#10b981' // Emerald-500 Accent
    },
    logoTextContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    logoTextMain: {
        color: '#FFFFFF',
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: -1
    },
    logoTextSub: {
        color: '#d4d4d8', // Zinc-300
        fontWeight: 'normal',
        fontFamily: 'Helvetica'
    },
    headerRight: {
        alignItems: 'flex-end'
    },
    title: {
        color: '#FFFFFF',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
        opacity: 0.9
    },
    refNumber: {
        color: '#10b981', // Emerald text for ref
        fontSize: 10,
        fontFamily: 'Helvetica-Bold'
    },
    // Main Content
    container: {
        paddingHorizontal: 40,
        paddingBottom: 40
    },
    // Meta Grid (Date, Valid Until)
    metaSection: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Changed to space-between
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: '1pt solid #f4f4f5'
    },
    metaCol: {
        width: '45%'
    },
    metaLabel: {
        fontSize: 7,
        color: '#71717a',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        fontFamily: 'Helvetica-Bold'
    },
    metaValue: {
        fontSize: 11,
        color: '#000000'
    },
    // Addresses
    addressGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        gap: 20
    },
    addressBlock: {
        width: '48%',
        backgroundColor: '#fbfbfa',
        padding: 15,
        borderRadius: 6
    },
    addressTitle: {
        fontSize: 7,
        color: '#10b981', // Emerald Title
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
        fontFamily: 'Helvetica-Bold'
    },
    addressText: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#18181b'
    },
    // Table
    table: {
        marginBottom: 30,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1pt solid #f4f4f5'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#18181b', // Dark Header
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    th: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: '#FFFFFF' // White text
    },
    // Column widths
    col1: { width: '50%' },
    col2: { width: '35%' },
    col3: { width: '15%', textAlign: 'right' },

    row: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottom: '1pt solid #f4f4f5'
    },
    itemName: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 3,
        color: '#18181b'
    },
    itemDesc: {
        fontSize: 8,
        color: '#71717a',
        lineHeight: 1.4,
        paddingRight: 10
    },
    specRow: {
        flexDirection: 'row',
        marginBottom: 1
    },
    specLabel: {
        fontSize: 7,
        color: '#a1a1aa',
        width: '40%',
        textTransform: 'uppercase'
    },
    specVal: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#52525b'
    },
    qtyText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold'
    },

    // Notes
    notesContainer: {
        marginTop: 10,
        marginBottom: 30,
        borderLeft: '3pt solid #10b981',
        paddingLeft: 12
    },
    notesLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#18181b',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    notesText: {
        fontSize: 9,
        color: '#52525b',
        lineHeight: 1.5,
        fontStyle: 'italic'
    },

    // Sign-off section
    signOffSection: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    signOffContent: {
        width: '40%',
        borderTop: '1pt solid #e4e4e7',
        paddingTop: 10
    },
    signOffText: {
        fontSize: 9,
        color: '#52525b',
        marginBottom: 4
    },
    signOffTeam: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#18181b'
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: '1pt solid #e4e4e7', // Light border
        paddingTop: 12
    },
    footerLeft: {
        fontSize: 7,
        color: '#a1a1aa',
        fontFamily: 'Helvetica'
    },
    footerRight: {
        fontSize: 7,
        color: '#a1a1aa'
    }
});

const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const InvoicePDF = ({ invoiceData, customSettings }) => {
    const { title, logoUrl, senderAddress, recipientAddress, invoiceNumber, date, notes } = customSettings;
    const items = invoiceData.items || [];

    return (
        <Document author="Forplus Procurement" title={title || "Quotation"}>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.headerBand}>
                    <View style={styles.logoTextContainer}>
                        <Text style={styles.logoTextMain}>FOR<Text style={styles.logoTextSub}>PLUS</Text></Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>{title || "OFFICIAL QUOTATION"}</Text>
                        <Text style={styles.refNumber}>REF: {invoiceNumber}</Text>
                    </View>
                </View>

                <View style={styles.container}>
                    {/* Meta Section */}
                    <View style={styles.metaSection}>
                        <View style={styles.metaCol}>
                            <Text style={styles.metaLabel}>Date of Issue</Text>
                            <Text style={styles.metaValue}>{formatDate(date)}</Text>
                        </View>
                        <View style={{ ...styles.metaCol, alignItems: 'flex-end' }}>
                            <Text style={styles.metaLabel}>Valid Until</Text>
                            <Text style={styles.metaValue}>{formatDate(new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString())}</Text>
                        </View>
                    </View>

                    {/* Address Cards */}
                    <View style={styles.addressGrid}>
                        <View style={styles.addressBlock}>
                            <Text style={styles.addressTitle}>Originator</Text>
                            <Text style={styles.addressText}>{senderAddress}</Text>
                        </View>
                        <View style={styles.addressBlock}>
                            <Text style={styles.addressTitle}>Supplier</Text>
                            <Text style={styles.addressText}>{recipientAddress}</Text>
                        </View>
                    </View>

                    {/* Styled Table */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <View style={styles.col1}><Text style={styles.th}>Item Description</Text></View>
                            <View style={styles.col2}><Text style={styles.th}>Specifications</Text></View>
                            <View style={styles.col3}><Text style={styles.th}>Quantities</Text></View>
                        </View>

                        {items.map((item, index) => (
                            <View key={index} style={{
                                ...styles.row,
                                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#f9fafb' // Alternating stripes
                            }} wrap={false}>
                                <View style={styles.col1}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDesc}>
                                        {item.description
                                            ? (item.description.length > 120 ? item.description.substring(0, 120) + "..." : item.description)
                                            : "See technical docs."}
                                    </Text>
                                </View>
                                <View style={styles.col2}>
                                    {(() => {
                                        let specs = item.specifications;
                                        if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch { } }
                                        if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                                            const entries = Object.entries(specs).slice(0, 4);
                                            return entries.map(([k, v]) => (
                                                <View key={k} style={styles.specRow}>
                                                    <Text style={styles.specLabel}>{k.replace(/_/g, ' ')}</Text>
                                                    <Text style={styles.specVal}>{String(v)}</Text>
                                                </View>
                                            ));
                                        }
                                        return <Text style={{ fontSize: 7, color: '#a1a1aa' }}>Standard Specs</Text>;
                                    })()}
                                </View>
                                <View style={styles.col3}>
                                    <Text style={styles.qtyText}>{item.quantity || 1} Units</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Styled Notes */}
                    <View style={styles.notesContainer}>
                        <Text style={styles.notesLabel}>Notes & Instructions</Text>
                        <Text style={styles.notesText}>{notes || "Please review the above requirements and provide a formal quotation including delivery timelines and payment terms."}</Text>
                    </View>

                    {/* Signature Area */}
                    <View style={styles.signOffSection}>
                        <View style={styles.signOffContent}>
                            <Text style={styles.signOffText}>Authorized Signature:</Text>
                            <View style={{ height: 40 }} />
                            <Text style={styles.signOffText}>Best Regards,</Text>
                            <Text style={styles.signOffTeam}>Forplus Procurement Team</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerLeft}>© 2026 Forplus Inc. • Automated System • ISO 9001</Text>
                    <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
                </View>

            </Page>
        </Document>
    );
};
